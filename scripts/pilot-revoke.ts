import { network } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import { ISSUER } from "./issuer-governance.js";
import { CHAIN_ID, REGISTRY } from "./schema-governance.js";
import { readPilotRecord, registryInterface } from "./pilot-attestation.js";

const record = readPilotRecord();
const { ethers } = await network.create();
const [signer] = await ethers.getSigners();
if (signer === undefined) throw new Error("No issuer configured");
if (signer.address.toLowerCase() !== ISSUER.toLowerCase()) {
  throw new Error(`Wrong issuer: expected ${ISSUER}, got ${signer.address}`);
}
const chain = await ethers.provider.getNetwork();
if (chain.chainId !== CHAIN_ID) throw new Error(`Wrong chain: ${chain.chainId}`);

const reason = keccak256(toUtf8Bytes("SOVA_PILOT_LIFECYCLE_TEST_COMPLETE"));
const registry = new ethers.Contract(REGISTRY, registryInterface, signer);
const tx = await registry.revoke(record.attestationId, reason);
console.log(`attestation_id=${record.attestationId}`);
console.log(`reason=${reason}`);
console.log(`tx=${tx.hash}`);
const receipt = await tx.wait();
console.log(`block=${receipt.blockNumber}`);
console.log(`status=${receipt.status}`);
