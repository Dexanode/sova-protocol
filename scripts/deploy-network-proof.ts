import { network } from "hardhat";

const { ethers } = await network.create();
const [deployer] = await ethers.getSigners();
if (deployer === undefined) throw new Error("No deployer configured");
const contract = await ethers.deployContract("SovaNetworkProof");
await contract.waitForDeployment();
const receipt = await contract.deploymentTransaction()?.wait();
console.log(`deployer=${deployer.address}`);
console.log(`contract=${await contract.getAddress()}`);
console.log(`tx=${contract.deploymentTransaction()?.hash ?? ""}`);
console.log(`block=${receipt?.blockNumber ?? ""}`);
