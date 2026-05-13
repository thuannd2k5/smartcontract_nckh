import { ethers } from "hardhat";
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Contract } from 'ethers';

function parseEther(amount: number) {
   return ethers.utils.parseEther(amount.toString());
}

function formatEther(amount: number) {
   return Number.parseFloat(ethers.utils.formatEther(amount));
}

enum State {
   Production,
   PurchasedByAgent,
   SoldByAgent,
   PurchasedByCustomer,
   ShippedByAgent,
   ReceivedByDeliveryHub,
   ShippedByDeliveryHub,
   ReceivedByCustomer
}

describe("--- SupplyChain", function () {
   let admin: SignerWithAddress,
      factory: SignerWithAddress,
      agent: SignerWithAddress,
      deliveryHub: SignerWithAddress,
      customer: SignerWithAddress;
   let supplyChain: Contract;
   let token: Contract;

   beforeEach(async () => {
      await ethers.provider.send("hardhat_reset", []); /* reset network hardhat  */
      [admin, factory, agent, deliveryHub, customer] = await ethers.getSigners();

      const TOKEN = await ethers.getContractFactory("AgriToken", admin);
      token = await TOKEN.deploy();
      const SupplyChain = await ethers.getContractFactory("SupplyChain", admin);
      supplyChain = await SupplyChain.deploy(admin.address, token.address);
   });

   /* positive testing */
   it("Create product in supply chain", async () => {
      await supplyChain.connect(admin).addFactory(factory.address);
      await supplyChain.connect(admin).addAgent(agent.address);
      await supplyChain.connect(admin).addDeliveryHub(deliveryHub.address);
      await supplyChain.connect(customer).addCustomer(customer.address);
      await token.transfer(agent.address, parseEther(10 ** 3));
      await token.transfer(customer.address, parseEther(10 ** 3));
      const balanceFactoy = formatEther(await token.balanceOf(factory.address));
      const balanceAgent = formatEther(await token.balanceOf(agent.address));
      const balanceDeliveryHub = formatEther(await token.balanceOf(deliveryHub.address));
      const balanceCustomer = formatEther(await token.balanceOf(customer.address));
      const balanceContract = formatEther(await token.balanceOf(supplyChain.address));
      console.log("address factory:", factory.address, "|", balanceFactoy);
      console.log("address agent:", agent.address, "|", balanceAgent);
      console.log("address delivery hub:", deliveryHub.address, "|", balanceDeliveryHub);
      console.log("address customer:", customer.address, "|", balanceCustomer);
      // -> Step 1 x
      await supplyChain.connect(factory).productionProduct("Dâu tây", "dau", parseEther(30), "hoa qua", "http/factrory/image1", "dessdadcription", 50, "12/3/2024", "24/5/2025", "#factory");
      let product = await supplyChain.getProductByCode("dau");
      expect((await supplyChain.getProductCount()).toNumber()).equal(1);
      expect(await supplyChain.getProductState(product.uid)).equal(State.Production);
      // -> Step 2 x
      await token.connect(agent).approve(supplyChain.address, parseEther(30));
      await supplyChain.connect(agent).purchaseByAgent(product.uid, "#agentcode");
      expect(formatEther(await token.balanceOf(agent.address))).equal(balanceAgent - formatEther(product.productDetails.price));
      expect(await supplyChain.getProductState(product.uid)).equal(State.PurchasedByAgent);
      product = await supplyChain.getProductByCode("dau"); // update infomation for product
      // after sell product -> balance of factory + price product sell
      expect(formatEther(await token.balanceOf(factory.address))).equal(balanceFactoy + formatEther(product.productDetails.price));
      expect(product.owner).equal(agent.address);
      // -> Step 3
      await supplyChain.connect(agent).sellByAgent(product.uid, parseEther(50));
      expect(await supplyChain.getProductState(product.uid)).equal(State.SoldByAgent);
      // -> Step 4 x
      product = await supplyChain.getProductByCode("dau");
      await token.connect(customer).approve(supplyChain.address, product.productDetails.priceAgent + parseEther(5));
      await supplyChain.connect(customer).purchaseByCustomer(product.uid, parseEther(5), 'Dien duong, dien ban, quang nam', "#customerCode");
      product = await supplyChain.getProductByCode("dau");
      expect(formatEther(await token.balanceOf(customer.address))).equal(balanceCustomer - formatEther(product.productDetails.priceAgent) - formatEther(product.customerDetails.feeShip));
      expect(formatEther(await token.balanceOf(supplyChain.address))).equal(balanceContract + formatEther(product.productDetails.priceAgent) + formatEther(product.customerDetails.feeShip));
      console.log("balance contract step 4 is 55 token |", formatEther(await token.balanceOf(supplyChain.address)));
      expect(await product.customerDetails.customer).equal(customer.address);
      expect(await supplyChain.getProductState(product.uid)).equal(State.PurchasedByCustomer);
      // -> Step 5 
      await supplyChain.connect(agent).shipByAgent(product.uid);
      product = await supplyChain.getProductByCode("dau");
      expect(product.productState).equal(State.ShippedByAgent);
      // -> Step 6 x
      await supplyChain.connect(deliveryHub).receiveByDeliveryHub(product.uid, "deliveryHubcode");
      product = await supplyChain.getProductByCode("dau");
      expect(product.owner).equal(deliveryHub.address);
      expect(product.productState).equal(State.ReceivedByDeliveryHub);
      // Step 7
      await supplyChain.connect(deliveryHub).shipByDeliveryHub(product.uid);
      product = await supplyChain.getProductByCode("dau");
      expect(product.productState).equal(State.ShippedByDeliveryHub);
      // Step 8
      const balanceAgent2 = formatEther(await token.balanceOf(agent.address));
      await supplyChain.connect(customer).receiveByCustomer(product.uid);
      product = await supplyChain.getProductByCode("dau");
      expect(formatEther(await token.balanceOf(agent.address))).equal(balanceAgent2 + formatEther(product.productDetails.priceAgent) - formatEther(product.productDetails.priceAgent) / 10);
      console.log("balance of third party step 10 is 1015 token | ", formatEther(await token.balanceOf(agent.address)));
      expect(formatEther(await token.balanceOf(deliveryHub.address))).equal(balanceDeliveryHub + formatEther(product.customerDetails.feeShip) - formatEther(product.customerDetails.feeShip) / 10);
      console.log("balance delivery hub step 10 is 4.5 token |", formatEther(await token.balanceOf(deliveryHub.address)));
      console.log("balance contract step 10 is 5.5 token |", formatEther(await token.balanceOf(supplyChain.address)));
      console.log("balance customer step 10 is 945 |", formatEther(await token.balanceOf(customer.address)));
      expect(formatEther(await token.balanceOf(supplyChain.address))).equal(5.5);
      expect(product.owner).equal(customer.address);
      expect(product.productState).equal(State.ReceivedByCustomer);

      //->>>>> get data of product
      //console.log(await supplyChain.getProductByCode("dau"));
   });
   // negative testing
   it("Should not grant role, sender is not admin!", async () => {
      await expect(supplyChain.connect(factory).addAgent(agent.address)).revertedWith("Sender is not a admin");
   });
   it("Should not create product, Sender is not a factory!", async () => {
      await expect(supplyChain.connect(factory).productionProduct("Dâu tây", "dau", parseEther(30), "hoa qua", "http/factory/image1", "dessdadcription", 50, "43242.43", "23432.432", "#codefactory")).revertedWith("Sender is not a Factory!");
   });
});



