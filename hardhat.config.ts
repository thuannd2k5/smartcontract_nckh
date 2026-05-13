import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
   solidity: {
      version: "0.8.19",
      settings: {
         optimizer: {
            enabled: true,
            runs: 1,
         },
      }
   },
   networks: {
      bsctest: {
         url: "https://data-seed-prebsc-2-s3.binance.org:8545/",
         accounts: [process.env.PRIVATE_KEY],
      },
   },
   etherscan: {
      apiKey: process.env.API_KEY
   }
};
