import { ethers, hardhatArguments } from "hardhat";
import * as Config from "./config";

async function main() {
    await Config.initConfig();

    const network = hardhatArguments.network ?? "dev";

    const AgriToken = await ethers.getContractFactory("AgriToken");

    const token = await AgriToken.deploy();

    await token.deployed();

    console.log("AgriToken:", token.address);

    Config.setConfig(network + ".AgriToken", token.address);

    await Config.updateConfig();
}

main();