import { expect } from "chai";
import { ethers, fhevm, deployments } from "hardhat";
import { CleanEat } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CleanEat", function () {
  let cleaneat: CleanEat;
  let cleaneatAddress: string;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let logistics: HardhatEthersSigner;

  before(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    const signers = await ethers.getSigners();
    owner = signers[0];
    user1 = signers[1];
    user2 = signers[2];
    logistics = signers[3];
  });

  beforeEach(async function () {
    await deployments.fixture(["CleanEat"]);
    const CleanEatDeployment = await deployments.get("CleanEat");
    cleaneatAddress = CleanEatDeployment.address;
    cleaneat = await ethers.getContractAt("CleanEat", cleaneatAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await cleaneat.owner()).to.equal(owner.address);
    });

    it("Should initialize thresholds", async function () {
      const [nutrition, satisfaction] = await cleaneat.getThresholds();
      expect(nutrition).to.equal(70);
      expect(satisfaction).to.equal(75);
    });

    it("Should authorize owner by default", async function () {
      expect(await cleaneat.isAuthorized(owner.address)).to.be.true;
    });
  });

  describe("Rating Submission", function () {
    it("Should submit an encrypted rating", async function () {
      const stallId = 0;
      const nutritionScore = 85;
      const satisfactionScore = 90;
      const comment = "Great food!";

      // Encrypt scores
      const encryptedNutrition = await fhevm
        .createEncryptedInput(cleaneatAddress, user1.address)
        .add16(nutritionScore)
        .encrypt();
      
      const encryptedSatisfaction = await fhevm
        .createEncryptedInput(cleaneatAddress, user1.address)
        .add16(satisfactionScore)
        .encrypt();

      // Submit rating
      await expect(
        cleaneat.connect(user1).submitRating(
          stallId,
          encryptedNutrition.handles[0],
          encryptedNutrition.inputProof,
          encryptedSatisfaction.handles[0],
          encryptedSatisfaction.inputProof,
          comment
        )
      ).to.emit(cleaneat, "RatingSubmitted");

      // Check user ratings
      const userRatings = await cleaneat.getUserRatings(user1.address);
      expect(userRatings.length).to.equal(1);

      // Check stall rating count
      const count = await cleaneat.stallRatingCount(stallId);
      expect(count).to.equal(1);
    });

    it("Should reject invalid stall ID", async function () {
      const encryptedNutrition = await fhevm
        .createEncryptedInput(cleaneatAddress, user1.address)
        .add16(80)
        .encrypt();
      
      const encryptedSatisfaction = await fhevm
        .createEncryptedInput(cleaneatAddress, user1.address)
        .add16(85)
        .encrypt();

      await expect(
        cleaneat.connect(user1).submitRating(
          5, // Invalid stall ID
          encryptedNutrition.handles[0],
          encryptedNutrition.inputProof,
          encryptedSatisfaction.handles[0],
          encryptedSatisfaction.inputProof,
          "Test"
        )
      ).to.be.revertedWith("Invalid stall ID");
    });

    it("Should allow multiple ratings from same user", async function () {
      const encryptedNutrition = await fhevm
        .createEncryptedInput(cleaneatAddress, user1.address)
        .add16(80)
        .encrypt();
      
      const encryptedSatisfaction = await fhevm
        .createEncryptedInput(cleaneatAddress, user1.address)
        .add16(85)
        .encrypt();

      await cleaneat.connect(user1).submitRating(
        0,
        encryptedNutrition.handles[0],
        encryptedNutrition.inputProof,
        encryptedSatisfaction.handles[0],
        encryptedSatisfaction.inputProof,
        "Rating 1"
      );
      
      const encryptedNutrition2 = await fhevm
        .createEncryptedInput(cleaneatAddress, user1.address)
        .add16(80)
        .encrypt();
      
      const encryptedSatisfaction2 = await fhevm
        .createEncryptedInput(cleaneatAddress, user1.address)
        .add16(85)
        .encrypt();

      await cleaneat.connect(user1).submitRating(
        1,
        encryptedNutrition2.handles[0],
        encryptedNutrition2.inputProof,
        encryptedSatisfaction2.handles[0],
        encryptedSatisfaction2.inputProof,
        "Rating 2"
      );

      const userRatings = await cleaneat.getUserRatings(user1.address);
      expect(userRatings.length).to.equal(2);
    });
  });

  describe("Aggregates", function () {
    beforeEach(async function () {
      // Submit test ratings for stall 0
      const stallId = 0;
      
      // User1: 80, 85
      const enc1N = await fhevm.createEncryptedInput(cleaneatAddress, user1.address).add16(80).encrypt();
      const enc1S = await fhevm.createEncryptedInput(cleaneatAddress, user1.address).add16(85).encrypt();
      await cleaneat.connect(user1).submitRating(
        stallId,
        enc1N.handles[0],
        enc1N.inputProof,
        enc1S.handles[0],
        enc1S.inputProof,
        "User1"
      );

      // User2: 90, 95
      const enc2N = await fhevm.createEncryptedInput(cleaneatAddress, user2.address).add16(90).encrypt();
      const enc2S = await fhevm.createEncryptedInput(cleaneatAddress, user2.address).add16(95).encrypt();
      await cleaneat.connect(user2).submitRating(
        stallId,
        enc2N.handles[0],
        enc2N.inputProof,
        enc2S.handles[0],
        enc2S.inputProof,
        "User2"
      );
    });

    it("Should return encrypted aggregates and allow authorization", async function () {
      const result = await cleaneat.connect(owner).getStallAggregates.staticCall(0);
      // Access returned tuple elements by named property
      expect(result.totalRatings).to.equal(2);
      // Note: nutritionSum and satisfactionSum are encrypted euint16 handles
      // In a real scenario, these would need to be decrypted using the FHEVM gateway
      expect(result.nutritionSum).to.not.equal(ethers.ZeroHash);
      expect(result.satisfactionSum).to.not.equal(ethers.ZeroHash);
    });

    it("Should return zero count for stalls with no ratings", async function () {
      const result = await cleaneat.connect(owner).getStallAggregates.staticCall(1);
      expect(result.totalRatings).to.equal(0);
    });
  });

  describe("Rating Queries", function () {
    it("Should return correct rating details", async function () {
      const stallId = 2;
      const comment = "Nice meal";
      
      const encN = await fhevm.createEncryptedInput(cleaneatAddress, user1.address).add16(75).encrypt();
      const encS = await fhevm.createEncryptedInput(cleaneatAddress, user1.address).add16(80).encrypt();
      await cleaneat.connect(user1).submitRating(
        stallId,
        encN.handles[0],
        encN.inputProof,
        encS.handles[0],
        encS.inputProof,
        comment
      );

      const ratingId = 0;
      const [user, stall, , , returnedComment, timestamp] = await cleaneat.getRating(ratingId);

      expect(user).to.equal(user1.address);
      expect(stall).to.equal(stallId);
      expect(returnedComment).to.equal(comment);
      expect(timestamp).to.be.gt(0);
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize logistics", async function () {
      await expect(cleaneat.connect(owner).setLogisticsAuthorization(logistics.address, true))
        .to.emit(cleaneat, "LogisticsAuthorized")
        .withArgs(logistics.address, true);

      expect(await cleaneat.isAuthorized(logistics.address)).to.be.true;
    });

    it("Should reject non-owner authorization", async function () {
      await expect(
        cleaneat.connect(user1).setLogisticsAuthorization(logistics.address, true)
      ).to.be.revertedWith("Only owner");
    });

    it("Should allow revoking authorization", async function () {
      await cleaneat.connect(owner).setLogisticsAuthorization(logistics.address, true);
      await cleaneat.connect(owner).setLogisticsAuthorization(logistics.address, false);

      expect(await cleaneat.isAuthorized(logistics.address)).to.be.false;
    });
  });

  describe("Thresholds", function () {
    it("Should allow owner to update thresholds", async function () {
      await expect(cleaneat.connect(owner).updateThresholds(80, 85))
        .to.emit(cleaneat, "ThresholdUpdated")
        .withArgs(80, 85);

      const [nutrition, satisfaction] = await cleaneat.getThresholds();
      expect(nutrition).to.equal(80);
      expect(satisfaction).to.equal(85);
    });

    it("Should reject non-owner threshold updates", async function () {
      await expect(
        cleaneat.connect(user1).updateThresholds(80, 85)
      ).to.be.revertedWith("Only owner");
    });
  });

  describe("User Decryption", function () {
    it("Should allow user to request decryption of own rating", async function () {
      const encN = await fhevm.createEncryptedInput(cleaneatAddress, user1.address).add16(75).encrypt();
      const encS = await fhevm.createEncryptedInput(cleaneatAddress, user1.address).add16(80).encrypt();
      await cleaneat.connect(user1).submitRating(
        0,
        encN.handles[0],
        encN.inputProof,
        encS.handles[0],
        encS.inputProof,
        "Test"
      );

      const ratingId = 0;
      await expect(cleaneat.connect(user1).allowUserDecrypt(ratingId)).to.not.be.reverted;
    });

    it("Should reject decryption of other user's rating", async function () {
      const encN = await fhevm.createEncryptedInput(cleaneatAddress, user1.address).add16(75).encrypt();
      const encS = await fhevm.createEncryptedInput(cleaneatAddress, user1.address).add16(80).encrypt();
      await cleaneat.connect(user1).submitRating(
        0,
        encN.handles[0],
        encN.inputProof,
        encS.handles[0],
        encS.inputProof,
        "Test"
      );

      const ratingId = 0;
      await expect(
        cleaneat.connect(user2).allowUserDecrypt(ratingId)
      ).to.be.revertedWith("Not your rating");
    });
  });

  describe("Stall Names", function () {
    it("Should return correct stall names", async function () {
      expect(await cleaneat.getStallName(0)).to.equal("Stall A - Sichuan Cuisine");
      expect(await cleaneat.getStallName(1)).to.equal("Stall B - Cantonese Cuisine");
      expect(await cleaneat.getStallName(2)).to.equal("Stall C - Western Fast Food");
      expect(await cleaneat.getStallName(3)).to.equal("Stall D - Noodle Bar");
      expect(await cleaneat.getStallName(4)).to.equal("Stall E - Vegetarian Options");
    });
  });
});
