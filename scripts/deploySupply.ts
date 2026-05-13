import { ethers, hardhatArguments } from "hardhat";
import * as Config from "./config";

async function main() {
    await Config.initConfig();

    const network = hardhatArguments.network ?? "dev";

    const config = Config.getConfig();

    const tokenAddress = config[network].AgriToken;

    const [deployer] = await ethers.getSigners();

    const SupplyChain = await ethers.getContractFactory("SupplyChain");

    const supply = await SupplyChain.deploy(
        deployer.address,
        tokenAddress
    );

    await supply.deployed();

    console.log("SupplyChain:", supply.address);

    Config.setConfig(
        network + ".SupplyChain",
        supply.address
    );

    await Config.updateConfig();
}

main();