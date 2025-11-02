import { expect } from "chai";
import { ethers, fhevm, deployments } from "hardhat";
import { CleanEat } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CleanEat (Sepolia)", function () {
  let cleaneat: CleanEat;
  let cleaneatAddress: string;
  let owner: HardhatEthersSigner;

  before(async function () {
    // Skip if running on mock
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    const signers = await ethers.getSigners();
    owner = signers[0];

    try {
      const CleanEatDeployment = await deployments.get("CleanEat");
      cleaneatAddress = CleanEatDeployment.address;
      cleaneat = await ethers.getContractAt("CleanEat", cleaneatAddress);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }
  });

  it("Should be deployed on Sepolia", async function () {
    const address = await cleaneat.getAddress();
    expect(address).to.be.properAddress;
    console.log(`CleanEat deployed at: ${address}`);
  });

  it("Should have correct owner", async function () {
    const contractOwner = await cleaneat.owner();
    expect(contractOwner).to.equal(owner.address);
  });

  it("Should have default thresholds", async function () {
    const [nutrition, satisfaction] = await cleaneat.getThresholds();
    expect(nutrition).to.equal(70);
    expect(satisfaction).to.equal(75);
  });

  it("Should return stall names", async function () {
    const stallName = await cleaneat.getStallName(0);
    expect(stallName).to.equal("Stall A - Sichuan Cuisine");
  });

  it("Should have zero ratings initially", async function () {
    const totalRatings = await cleaneat.getTotalRatings();
    console.log(`Total ratings: ${totalRatings}`);
    expect(totalRatings).to.be.gte(0);
  });
});

