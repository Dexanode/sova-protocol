import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { AbiCoder, JsonRpcProvider, hexlify, keccak256, randomBytes, toUtf8Bytes } from "ethers";
import {
  SOVA_REGISTRY_ADDRESS,
  SOVA_SCHEMA_ID,
  WHITECHAIN_SEPOLIA_CHAIN_ID,
  computeDataHash,
  computeSubjectId,
} from "../src/SovaReadClient.js";
import {
  PILOT_ISSUER,
  PILOT_SUBJECT,
  buildSyntheticPayload,
  type DisclosureRecord,
  type RelayRequest,
} from "../src/issuer/TypedAttestation.js";

const REQUEST_FILE = "issuer-data/pending-request.json";
const DISCLOSURE_FILE = "issuer-data/pending-disclosure.json";
if (existsSync(REQUEST_FILE) || existsSync(DISCLOSURE_FILE)) {
  throw new Error("Pending issuer files already exist; archive them before preparing another request");
}
const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const provider = new JsonRpcProvider(rpc, 1874, { staticNetwork: true });
const validityDays = Number(process.argv[2] ?? process.env.SOVA_RELAY_VALIDITY_DAYS ?? "7");
if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 90) {
  throw new Error("SOVA_RELAY_VALIDITY_DAYS must be an integer from 1 to 90");
}
const block = await provider.getBlock("latest");
if (block === null) throw new Error("Latest block unavailable");
const issuedAt = BigInt(block.timestamp);
const expiresAt = issuedAt + BigInt(validityDays) * 24n * 60n * 60n;
const deadline = issuedAt + 15n * 60n;
const nonce = hexlify(randomBytes(32));
const salt = hexlify(randomBytes(32));
const payload = buildSyntheticPayload(issuedAt, hexlify(randomBytes(32)));
const subjectId = computeSubjectId(WHITECHAIN_SEPOLIA_CHAIN_ID, PILOT_SUBJECT);
const dataHash = computeDataHash(SOVA_SCHEMA_ID, payload, salt);
const attestationDomain = keccak256(toUtf8Bytes("SOVA_ATTESTATION_V1"));
const attestationId = keccak256(
  AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32", "bytes32", "address", "bytes32"],
    [attestationDomain, subjectId, SOVA_SCHEMA_ID, PILOT_ISSUER, nonce],
  ),
);
const request: RelayRequest = {
  domain: {
    name: "SOVA Attestation Registry",
    version: "1",
    chainId: "1874",
    verifyingContract: SOVA_REGISTRY_ADDRESS,
  },
  input: {
    subjectId,
    schemaId: SOVA_SCHEMA_ID,
    dataHash,
    issuedAt: issuedAt.toString(),
    expiresAt: expiresAt.toString(),
    issuerEpoch: "1",
    nonce,
  },
  issuer: PILOT_ISSUER,
  deadline: deadline.toString(),
  attestationId,
};
const disclosure: DisclosureRecord = { encodedPayload: payload, salt };
mkdirSync("issuer-data", { recursive: true });
writeFileSync(REQUEST_FILE, `${JSON.stringify(request, null, 2)}\n`, { flag: "wx" });
writeFileSync(DISCLOSURE_FILE, `${JSON.stringify(disclosure, null, 2)}\n`, { flag: "wx" });
console.log(`attestation_id=${attestationId}`);
console.log(`issued_at=${issuedAt}`);
console.log(`deadline=${deadline}`);
console.log(`validity_days=${validityDays}`);
console.log(`request=${REQUEST_FILE}`);
console.log(`disclosure=${DISCLOSURE_FILE}`);
