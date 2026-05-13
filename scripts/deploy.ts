import { ethers, hardhatArguments } from "hardhat";
import * as Config from "./config";

async function main() {
   await Config.initConfig();

   const network = hardhatArguments.network ?? "dev";

   const [deployer] = await ethers.getSigners();

   console.log("deploy from address:", deployer.address);

   // =========================
   // DEPLOY TOKEN
   // =========================

   const AgriToken = await ethers.getContractFactory("AgriToken");

   const agriToken = await AgriToken.deploy();

   await agriToken.deployed();

   console.log("AgriToken address:", agriToken.address);

   Config.setConfig(network + ".AgriToken", agriToken.address);

   // =========================
   // DEPLOY ICO
   // =========================

   const AGTCrowdSale = await ethers.getContractFactory("AGTCrowdSale");

   const ico = await AGTCrowdSale.deploy(
      1000,
      deployer.address,
      agriToken.address
   );

   await ico.deployed();

   console.log("ICO address:", ico.address);

   Config.setConfig(network + ".Ico", ico.address);

   // =========================
   // TRANSFER TOKEN TO ICO
   // =========================

   const amount = ethers.utils.parseEther("50000");

   const txTransfer = await agriToken.transfer(
      ico.address,
      amount
   );

   await txTransfer.wait();

   console.log("Transfer 50000 AGT to ICO success");

   // =========================
   // DEPLOY SUPPLYCHAIN
   // =========================

   const SupplyChain = await ethers.getContractFactory("SupplyChain");

   const supplyChain = await SupplyChain.deploy(
      deployer.address,
      agriToken.address
   );

   await supplyChain.deployed();

   console.log("SupplyChain address:", supplyChain.address);

   Config.setConfig(network + ".SupplyChain", supplyChain.address);

   // =========================
   // SAVE CONFIG
   // =========================

   await Config.updateConfig();

   console.log("Deploy completed");
}

main()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error(error);
      process.exit(1);
   });