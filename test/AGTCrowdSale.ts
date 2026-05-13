import { ethers } from "hardhat";
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Contract } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

function parseEther(amount: number) {
   return ethers.utils.parseEther(amount.toString());
}

describe("---AGTCrowdSale", function () {
   let owner: SignerWithAddress,
      alice: SignerWithAddress,
      bob: SignerWithAddress;
   let AGTCrowdSale: Contract;
   let token: Contract;

   beforeEach(async () => {
      await ethers.provider.send("hardhat_reset", []); /* reset network hardhat  */
      [owner, alice, bob] = await ethers.getSigners();

      const TOKEN = await ethers.getContractFactory("AgriToken", owner);
      token = await TOKEN.deploy();
      const AGTCROWDSALE = await ethers.getContractFactory("AGTCrowdSale", owner);
      AGTCrowdSale = await AGTCROWDSALE.deploy(1000, owner.address, token.address);
   })

   // positive testing
   it("Buy token by BNB", async () => {
      await token.transfer(AGTCrowdSale.address, parseEther(50000));
      await AGTCrowdSale.connect(alice).buyTokenByBNB({ value: parseEther(5) });
      const balanceOwner = await ethers.provider.getBalance(owner.address);
      console.log(Number.parseFloat(ethers.utils.formatEther(balanceOwner)));
      console.log('------', await token.balanceOf(alice.address))
      expect(await token.balanceOf(alice.address)).equal(parseEther(5000));
      expect(await token.balanceOf(AGTCrowdSale.address)).equal(parseEther(45000));
   })
   it("Buy token by BNB with new rate bnb", async () => {
      await AGTCrowdSale.connect(owner).setBNBRate(100);
      await token.transfer(AGTCrowdSale.address, parseEther(50000));
      await AGTCrowdSale.connect(alice).buyTokenByBNB({ value: parseEther(5) });
      expect(await token.balanceOf(alice.address)).equal(parseEther(500));
      expect(await token.balanceOf(AGTCrowdSale.address)).equal(parseEther(49500));
   });
   // negative testing
   it("Should not buy BNB, Insufficient account balance(address(this))", async () => {
      await expect(AGTCrowdSale.connect(alice).buyTokenByBNB({ value: parseEther(5) })).revertedWith('Insufficient account balance in address(this)');
   })
   it("Should not buy BNB, Insufficient account balance(address(this))", async () => {
      await expect(AGTCrowdSale.connect(alice).setBNBRate(100)).revertedWith("Ownable: caller is not the owner");
   })
})