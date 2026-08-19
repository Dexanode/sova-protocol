import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { network } from "hardhat";
import { AbiCoder, Interface, hexlify, keccak256, randomBytes, toUtf8Bytes } from "ethers";
import { ISSUER } from "./issuer-governance.js";
import { CHAIN_ID, REGISTRY, schemaId } from "./schema-governance.js";

export const SUBJECT = "0xee76b045CA9093e40F2a298B9e218c910614e815";
export const PROTOCOL = "0x9AD126155e6674dd33668b3eaf9Aa2B7c68D1D52";
export const PILOT_FILE = "pilot-data/latest-attestation.json";
export const registryInterface = new Interface([
  "function attest((bytes32 subjectId,bytes32 schemaId,bytes32 dataHash,uint64 issuedAt,uint64 expiresAt,uint64 issuerEpoch,bytes32 nonce)) returns (bytes32)",
  "function revoke(bytes32 attestationId,bytes32 reason)",
  "function getAttestation(bytes32) view returns (bytes32 subjectId,bytes32 schemaId,bytes32 dataHash,address issuer,uint64 issuedAt,uint64 expiresAt,uint64 issuerEpoch,uint64 revokedAt,bytes32 revocationReason)",
  "function getAttestationStatus(bytes32) view returns (uint8)",
  "function isUsable(bytes32) view returns (bool)",
]);

type PilotRecord = {
  attestationId: string;
  subjectId: string;
  dataHash: string;
  nonce: string;
  salt: string;
  payload: string;
  issuedAt: string;
  expiresAt: string;
  issuerEpoch: string;
  transactionHash: string;
  blockNumber: number;
};

export function readPilotRecord(): PilotRecord {
  return JSON.parse(readFileSync(PILOT_FILE, "utf8")) as PilotRecord;
}

export async function issuePilotAttestation(): Promise<void> {
  if (existsSync(PILOT_FILE)) {
    throw new Error(`${PILOT_FILE} already exists; refusing to issue an untracked duplicate`);
  }
  const { ethers } = await network.create();
  const [signer] = await ethers.getSigners();
  if (signer === undefined) throw new Error("No issuer configured");
  if (signer.address.toLowerCase() !== ISSUER.toLowerCase()) {
    throw new Error(`Wrong issuer: expected ${ISSUER}, got ${signer.address}`);
  }
  const chain = await ethers.provider.getNetwork();
  if (chain.chainId !== CHAIN_ID) throw new Error(`Wrong chain: ${chain.chainId}`);
  const latest = await ethers.provider.getBlock("latest");
  if (latest === null) throw new Error("Latest block unavailable");

  const issuedAt = BigInt(latest.timestamp);
  const expiresAt = issuedAt + 7n * 24n * 60n * 60n;
  const subjectDomain = keccak256(toUtf8Bytes("SOVA_SUBJECT_V1"));
  const attestationDomain = keccak256(toUtf8Bytes("SOVA_ATTESTATION_V1"));
  const subjectId = keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256", "address"],
      [subjectDomain, CHAIN_ID, SUBJECT],
    ),
  );
  const marketId = keccak256(toUtf8Bytes("SOVA_SYNTHETIC_MARKET_V1"));
  const positionRef = hexlify(randomBytes(32));
  const payload = AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address", "bytes32", "bytes32", "uint8", "uint64", "uint64"],
    [CHAIN_ID, PROTOCOL, marketId, positionRef, 1, issuedAt - 86_400n, issuedAt - 60n],
  );
  const salt = hexlify(randomBytes(32));
  const nonce = hexlify(randomBytes(32));
  const dataHash = keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes", "bytes32"],
      [schemaId, payload, salt],
    ),
  );
  const attestationId = keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32", "bytes32", "address", "bytes32"],
      [attestationDomain, subjectId, schemaId, ISSUER, nonce],
    ),
  );

  const registry = new ethers.Contract(REGISTRY, registryInterface, signer);
  const tx = await registry.attest({
    subjectId,
    schemaId,
    dataHash,
    issuedAt,
    expiresAt,
    issuerEpoch: 1n,
    nonce,
  });
  console.log(`issuer=${signer.address}`);
  console.log(`subject=${SUBJECT}`);
  console.log(`attestation_id=${attestationId}`);
  console.log(`tx=${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`block=${receipt.blockNumber}`);
  console.log(`status=${receipt.status}`);

  mkdirSync("pilot-data", { recursive: true });
  writeFileSync(
    PILOT_FILE,
    `${JSON.stringify(
      {
        attestationId,
        subjectId,
        dataHash,
        nonce,
        salt,
        payload,
        issuedAt: issuedAt.toString(),
        expiresAt: expiresAt.toString(),
        issuerEpoch: "1",
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
      } satisfies PilotRecord,
      null,
      2,
    )}\n`,
    { encoding: "utf8", flag: "wx" },
  );
  console.log(`local_record=${PILOT_FILE}`);
}
