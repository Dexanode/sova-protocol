import { readFileSync } from "node:fs";
import { network } from "hardhat";
import {
  PILOT_ISSUER,
  recoverRelaySigner,
  type SignedRelayRequest,
} from "../src/issuer/TypedAttestation.js";
import { SOVA_REGISTRY_ADDRESS, WHITECHAIN_SEPOLIA_CHAIN_ID } from "../src/SovaReadClient.js";

const RELAYER = "0xee76b045CA9093e40F2a298B9e218c910614e815";
const request = JSON.parse(
  readFileSync("issuer-data/signed-request.json", "utf8"),
) as SignedRelayRequest;
const recovered = recoverRelaySigner(request);
if (recovered.toLowerCase() !== PILOT_ISSUER.toLowerCase()) {
  throw new Error(`Invalid issuer signature: recovered ${recovered}`);
}
const { ethers } = await network.create();
const [relayer] = await ethers.getSigners();
if (relayer === undefined || relayer.address.toLowerCase() !== RELAYER.toLowerCase()) {
  throw new Error(`Wrong relayer: ${relayer?.address ?? "missing"}`);
}
const chain = await ethers.provider.getNetwork();
if (chain.chainId !== WHITECHAIN_SEPOLIA_CHAIN_ID) throw new Error(`Wrong chain: ${chain.chainId}`);
const block = await ethers.provider.getBlock("latest");
if (block === null) throw new Error("Latest block unavailable");
const chainTimestamp = BigInt(block.timestamp);
const issuedAt = BigInt(request.input.issuedAt);
const skew = chainTimestamp > issuedAt ? chainTimestamp - issuedAt : issuedAt - chainTimestamp;
if (skew > 240n) {
  throw new Error(`STALE_ISSUED_AT: skew=${skew}s; run npm run issuer:sign-relay again`);
}
if (chainTimestamp > BigInt(request.deadline)) {
  throw new Error("SIGNATURE_EXPIRED: run npm run issuer:sign-relay again");
}
const registry = new ethers.Contract(
  SOVA_REGISTRY_ADDRESS,
  ["function attestBySig((bytes32,bytes32,bytes32,uint64,uint64,uint64,bytes32),address,uint256,bytes) returns (bytes32)"],
  relayer,
);
const tx = await registry.attestBySig(
  [
    request.input.subjectId,
    request.input.schemaId,
    request.input.dataHash,
    request.input.issuedAt,
    request.input.expiresAt,
    request.input.issuerEpoch,
    request.input.nonce,
  ],
  request.issuer,
  request.deadline,
  request.signature,
);
console.log(`relayer=${relayer.address}`);
console.log(`issuer=${request.issuer}`);
console.log(`attestation_id=${request.attestationId}`);
console.log(`tx=${tx.hash}`);
const receipt = await tx.wait();
console.log(`block=${receipt.blockNumber}`);
console.log(`status=${receipt.status}`);
