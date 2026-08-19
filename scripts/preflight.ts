import { network } from "hardhat";

const { ethers } = await network.create();
const [deployer] = await ethers.getSigners();

if (deployer === undefined) {
  throw new Error("No deployer account is configured for this network");
}

const providerNetwork = await ethers.provider.getNetwork();
const balance = await ethers.provider.getBalance(deployer.address);

console.log(`network=${providerNetwork.name}`);
console.log(`chain_id=${providerNetwork.chainId}`);
console.log(`deployer=${deployer.address}`);
console.log(`balance_wbt=${ethers.formatEther(balance)}`);
