import { readFileSync } from "node:fs";
import { network } from "hardhat";

type GovernanceConfig = { signers: string[]; threshold: number; minDelay: number };
const parameters = JSON.parse(
  readFileSync("config/governance-whitechain-sepolia.json", "utf8"),
) as GovernanceConfig;
const { ethers } = await network.create();
const [deployer] = await ethers.getSigners();
if (deployer === undefined) throw new Error("No deployer configured");

const governance = await ethers.deployContract("SovaTimelockMultisig", [
  parameters.signers,
  parameters.threshold,
  parameters.minDelay,
]);
await governance.waitForDeployment();
const governanceReceipt = await governance.deploymentTransaction()?.wait();
const governanceAddress = await governance.getAddress();

const registry = await ethers.deployContract("SovaAttestationRegistry", [governanceAddress]);
await registry.waitForDeployment();
const registryReceipt = await registry.deploymentTransaction()?.wait();

console.log(`deployer=${deployer.address}`);
console.log(`governance=${governanceAddress}`);
console.log(`governance_tx=${governance.deploymentTransaction()?.hash ?? ""}`);
console.log(`governance_block=${governanceReceipt?.blockNumber ?? ""}`);
console.log(`registry=${await registry.getAddress()}`);
console.log(`registry_tx=${registry.deploymentTransaction()?.hash ?? ""}`);
console.log(`registry_block=${registryReceipt?.blockNumber ?? ""}`);
