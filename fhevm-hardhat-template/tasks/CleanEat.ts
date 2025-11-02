import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:CleanEat:getStallAggregates")
  .addParam("address", "CleanEat contract address")
  .addParam("stallid", "Stall ID (0-4)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const CleanEat = await deployments.get("CleanEat");
    const cleaneat = await ethers.getContractAt("CleanEat", taskArguments.address || CleanEat.address);

    const stallId = parseInt(taskArguments.stallid);
    const [avgNutrition, avgSatisfaction, totalRatings] = await cleaneat.getStallAggregates(stallId);

    console.log(`\nStall ${stallId} Aggregates:`);
    console.log(`  Average Nutrition: ${avgNutrition}`);
    console.log(`  Average Satisfaction: ${avgSatisfaction}`);
    console.log(`  Total Ratings: ${totalRatings}`);
  });

task("task:CleanEat:getUserRatings")
  .addParam("address", "CleanEat contract address")
  .addParam("user", "User address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const CleanEat = await deployments.get("CleanEat");
    const cleaneat = await ethers.getContractAt("CleanEat", taskArguments.address || CleanEat.address);

    const ratingIds = await cleaneat.getUserRatings(taskArguments.user);
    console.log(`\nUser ${taskArguments.user} has ${ratingIds.length} ratings:`);
    console.log(ratingIds.map((id) => id.toString()).join(", "));
  });

task("task:CleanEat:getThresholds")
  .addParam("address", "CleanEat contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const CleanEat = await deployments.get("CleanEat");
    const cleaneat = await ethers.getContractAt("CleanEat", taskArguments.address || CleanEat.address);

    const [nutritionThreshold, satisfactionThreshold] = await cleaneat.getThresholds();
    console.log(`\nCurrent Thresholds:`);
    console.log(`  Nutrition: ${nutritionThreshold}`);
    console.log(`  Satisfaction: ${satisfactionThreshold}`);
  });

task("task:CleanEat:authorizeLogistics")
  .addParam("address", "CleanEat contract address")
  .addParam("logistics", "Logistics staff address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const CleanEat = await deployments.get("CleanEat");
    const cleaneat = await ethers.getContractAt("CleanEat", taskArguments.address || CleanEat.address);

    const tx = await cleaneat.setLogisticsAuthorization(taskArguments.logistics, true);
    await tx.wait();
    console.log(`\nAuthorized logistics staff: ${taskArguments.logistics}`);
  });

