import { readFileSync } from "node:fs";
import { network } from "hardhat";
import { AbiCoder, Interface, keccak256, toUtf8Bytes } from "ethers";
import { CHAIN_ID, GOVERNANCE, REGISTRY, SIGNER_1, SIGNER_2, schemaId } from "./schema-governance.js";

export { SIGNER_1, SIGNER_2 };
export const ISSUER = "0x9325b1eba43ad4a3104d191909ffa0dcfabb2b28";
export const VALID_FROM = 0n;
export const VALID_UNTIL = 1_789_692_176n;
const metadataBytes = readFileSync("issuers/pilot-issuer-v1.canonical.json");
export const metadataHash = keccak256(metadataBytes);
export const salt = keccak256(toUtf8Bytes(`SOVA_ISSUER_AUTHORIZATION_V1:${schemaId}:${ISSUER}`));

export const issuerRegistryInterface = new Interface([
  "function authorizeIssuer(bytes32 schemaId,address issuer,uint64 validFrom,uint64 validUntil,bytes32 metadataHash)",
  "function issuerAuthorizations(bytes32,address) view returns (bytes32 metadataHash,uint64 validFrom,uint64 validUntil,uint64 epoch,uint8 state)",
]);
export const issuerGovernanceInterface = new Interface([
  "function propose(address,uint256,bytes,bytes32) returns (bytes32)",
  "function approve(bytes32)",
  "function execute(address,uint256,bytes,bytes32) returns (bytes)",
  "function operations(bytes32) view returns (uint64 readyAt,uint64 approvals,bool executed)",
]);
export const data = issuerRegistryInterface.encodeFunctionData("authorizeIssuer", [
  schemaId,
  ISSUER,
  VALID_FROM,
  VALID_UNTIL,
  metadataHash,
]);
export const operationId = keccak256(
  AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address", "address", "uint256", "bytes", "bytes32"],
    [CHAIN_ID, GOVERNANCE, REGISTRY, 0n, data, salt],
  ),
);

export async function sendIssuerGovernanceAction(
  action: "propose" | "approve" | "execute",
  expectedSigner: string,
): Promise<void> {
  const { ethers } = await network.create();
  const [signer] = await ethers.getSigners();
  if (signer === undefined) throw new Error("No signer configured");
  if (signer.address.toLowerCase() !== expectedSigner.toLowerCase()) {
    throw new Error(`Wrong signer: expected ${expectedSigner}, got ${signer.address}`);
  }
  const chain = await ethers.provider.getNetwork();
  if (chain.chainId !== CHAIN_ID) throw new Error(`Wrong chain: ${chain.chainId}`);

  const governance = new ethers.Contract(GOVERNANCE, issuerGovernanceInterface, signer);
  const tx =
    action === "propose"
      ? await governance.propose(REGISTRY, 0n, data, salt)
      : action === "approve"
        ? await governance.approve(operationId)
        : await governance.execute(REGISTRY, 0n, data, salt);
  console.log(`action=${action}`);
  console.log(`signer=${signer.address}`);
  console.log(`issuer=${ISSUER}`);
  console.log(`operation_id=${operationId}`);
  console.log(`tx=${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`block=${receipt.blockNumber}`);
  console.log(`status=${receipt.status}`);
}
