import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { network } from "hardhat";
import {
  ATTESTATION_TYPES,
  PILOT_ISSUER,
  type DisclosureRecord,
  type RelayRequest,
  typedDataDomain,
  typedDataValue,
  validateRelayRequest,
} from "../src/issuer/TypedAttestation.js";

const SIGNED_FILE = "issuer-data/signed-request.json";
if (existsSync(SIGNED_FILE)) {
  const previous = JSON.parse(readFileSync(SIGNED_FILE, "utf8")) as RelayRequest;
  mkdirSync("issuer-data/archive", { recursive: true });
  renameSync(
    SIGNED_FILE,
    `issuer-data/archive/signed-request-${previous.deadline}.json`,
  );
}
const pendingRequest = JSON.parse(
  readFileSync("issuer-data/pending-request.json", "utf8"),
) as RelayRequest;
const disclosure = JSON.parse(
  readFileSync("issuer-data/pending-disclosure.json", "utf8"),
) as DisclosureRecord;
const { ethers } = await network.create();
const pendingValidity = BigInt(pendingRequest.input.expiresAt) - BigInt(pendingRequest.input.issuedAt);
const requestedValidity = process.env.SOVA_RELAY_VALIDITY_DAYS === undefined
  ? pendingValidity
  : BigInt(process.env.SOVA_RELAY_VALIDITY_DAYS) * 24n * 60n * 60n;
if (requestedValidity < 24n * 60n * 60n || requestedValidity > 90n * 24n * 60n * 60n) {
  throw new Error("Requested relay validity must be from 1 to 90 days");
}
const [signer] = await ethers.getSigners();
if (signer === undefined || signer.address.toLowerCase() !== PILOT_ISSUER.toLowerCase()) {
  throw new Error(`Wrong issuer signer: ${signer?.address ?? "missing"}`);
}
const block = await ethers.provider.getBlock("latest");
if (block === null) throw new Error("Latest block unavailable");
const issuedAt = BigInt(block.timestamp);
const request: RelayRequest = {
  ...pendingRequest,
  input: {
    ...pendingRequest.input,
    issuedAt: issuedAt.toString(),
    expiresAt: (issuedAt + requestedValidity).toString(),
  },
  deadline: (issuedAt + 15n * 60n).toString(),
};
const errors = validateRelayRequest(request, disclosure, BigInt(block.timestamp));
if (errors.length !== 0) throw new Error(`Refusing to sign: ${errors.join(",")}`);
const signature = await signer.signTypedData(
  typedDataDomain(request),
  ATTESTATION_TYPES,
  typedDataValue(request),
);
writeFileSync(SIGNED_FILE, `${JSON.stringify({ ...request, signature }, null, 2)}\n`, { flag: "wx" });
console.log(`issuer=${signer.address}`);
console.log(`attestation_id=${request.attestationId}`);
console.log(`issued_at=${request.input.issuedAt}`);
console.log(`deadline=${request.deadline}`);
console.log(`validity_seconds=${requestedValidity}`);
console.log(`signed_request=${SIGNED_FILE}`);
