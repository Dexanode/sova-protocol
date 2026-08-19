import { readFileSync } from "node:fs";
import { JsonRpcProvider } from "ethers";
import { SovaReadClient } from "../src/SovaReadClient.js";
import type { SignedRelayRequest } from "../src/issuer/TypedAttestation.js";

const request = JSON.parse(
  readFileSync("issuer-data/signed-request.json", "utf8"),
) as SignedRelayRequest;
const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const provider = new JsonRpcProvider(rpc, 1874, { staticNetwork: true });
const attestation = await new SovaReadClient(provider).getAttestation(request.attestationId);
console.log(`attestation_id=${request.attestationId}`);
console.log(`issuer=${attestation.issuer}`);
console.log(`status=${attestation.status}`);
console.log(`usable=${attestation.usable}`);
console.log(`issued_at=${attestation.issuedAt}`);
console.log(`expires_at=${attestation.expiresAt}`);
