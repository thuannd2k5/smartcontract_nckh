import { ethers, hardhatArguments } from 'hardhat';
import * as Config from './config';

async function main() {
   await Config.initConfig();
   const network = hardhatArguments.network ?? 'dev';
   const [deployer] = await ethers.getSigners();
   console.log('deploy from address: ', deployer.address);

   // const AgiToken = await ethers.getContractFactory("AgriToken");
   // const agriToken = await AgiToken.deploy();
   // console.log("AgriToken address: ", agriToken.address);
   // Config.setConfig(network + '.AgriToken', agriToken.address);

   // const Ico = await ethers.getContractFactory("AGTCrowdSale");
   // const ico = await Ico.deploy(10000, '0xbD0b94Df7A110Ee707112Fb25eBaf563A438a80b', '0x4D5d5241D1dac35249Fdf75d7A917beE26928189')
   // console.log("ICO address: ", ico.address);
   // Config.setConfig(network + '.Ico', ico.address);

   const SupplyChain = await ethers.getContractFactory("SupplyChain");
   const supplyChain = await SupplyChain.deploy('0xbD0b94Df7A110Ee707112Fb25eBaf563A438a80b', '0x4D5d5241D1dac35249Fdf75d7A917beE26928189');
   console.log("Supplychain address: ", supplyChain.address);
   Config.setConfig(network + '.SupplyChain', supplyChain.address);

   await Config.updateConfig();
}

main()
   .then(() => process.exit(0))
   .catch(error => {
      console.log(error);
      process.exit(1)
   })