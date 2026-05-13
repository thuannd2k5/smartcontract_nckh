import { ethers, hardhatArguments } from "hardhat";
import * as Config from "./config";

async function main() {
    await Config.initConfig();

    const network = hardhatArguments.network ?? "dev";

    const config = Config.getConfig();

    const tokenAddress = config[network].AgriToken;

    const [deployer] = await ethers.getSigners();

    const ICO = await ethers.getContractFactory("AGTCrowdSale");

    const ico = await ICO.deploy(
        1000,
        deployer.address,
        tokenAddress
    );

    await ico.deployed();

    console.log("ICO:", ico.address);

    const token = await ethers.getContractAt(
        "AgriToken",
        tokenAddress
    );

    await token.transfer(
        ico.address,
        ethers.utils.parseEther("50000")
    );

    Config.setConfig(network + ".Ico", ico.address);

    await Config.updateConfig();
}

main();