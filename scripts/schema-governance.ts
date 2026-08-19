import { readFileSync } from "node:fs";
import { network } from "hardhat";
import { AbiCoder, Interface, keccak256, toUtf8Bytes } from "ethers";

export const CHAIN_ID = 1874n;
export const GOVERNANCE = "0x43e6335B0930Ed35934d16eDe1be4c688E88c020";
export const REGISTRY = "0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf";
export const SIGNER_1 = "0xbfc5db81973207cad45f46854724c4969b14018d";
export const SIGNER_2 = "0x94a66f5bfd10dfe7187c6202343835141e435859";
export const MAX_VALIDITY = 7_776_000n;

const schemaBytes = readFileSync("schemas/onchain-credit-performance-v1.canonical.json");
export const schemaId = keccak256(schemaBytes);
export const metadataHash = schemaId;
export const salt = keccak256(toUtf8Bytes(`SOVA_SCHEMA_ACTIVATION_V1:${schemaId}`));

export const registryInterface = new Interface([
  "function registerSchema(bytes32 schemaId, bytes32 metadataHash, uint64 maxValidity)",
  "function schemas(bytes32) view returns (bytes32 metadataHash,uint64 maxValidity,bool active,bool exists)",
]);
export const governanceInterface = new Interface([
  "function propose(address,uint256,bytes,bytes32) returns (bytes32)",
  "function approve(bytes32)",
  "function execute(address,uint256,bytes,bytes32) returns (bytes)",
  "function operations(bytes32) view returns (uint64 readyAt,uint64 approvals,bool executed)",
]);
export const data = registryInterface.encodeFunctionData("registerSchema", [
  schemaId,
  metadataHash,
  MAX_VALIDITY,
]);
export const operationId = keccak256(
  AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address", "address", "uint256", "bytes", "bytes32"],
    [CHAIN_ID, GOVERNANCE, REGISTRY, 0n, data, salt],
  ),
);

export async function sendGovernanceAction(
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

  const governance = new ethers.Contract(GOVERNANCE, governanceInterface, signer);
  const tx =
    action === "propose"
      ? await governance.propose(REGISTRY, 0n, data, salt)
      : action === "approve"
        ? await governance.approve(operationId)
        : await governance.execute(REGISTRY, 0n, data, salt);
  console.log(`action=${action}`);
  console.log(`signer=${signer.address}`);
  console.log(`operation_id=${operationId}`);
  console.log(`tx=${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`block=${receipt.blockNumber}`);
  console.log(`status=${receipt.status}`);
}
