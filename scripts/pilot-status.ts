import { existsSync, readFileSync } from "node:fs";
import { Contract, Interface, JsonRpcProvider } from "ethers";

const REGISTRY = "0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf";
const PILOT_FILE = "pilot-data/latest-attestation.json";
const registryInterface = new Interface([
  "function getAttestation(bytes32) view returns (bytes32 subjectId,bytes32 schemaId,bytes32 dataHash,address issuer,uint64 issuedAt,uint64 expiresAt,uint64 issuerEpoch,uint64 revokedAt,bytes32 revocationReason)",
  "function getAttestationStatus(bytes32) view returns (uint8)",
  "function isUsable(bytes32) view returns (bool)",
]);

if (!existsSync(PILOT_FILE)) {
  throw new Error(`${PILOT_FILE} not found; run npm run pilot:issue successfully first`);
}
const record = JSON.parse(readFileSync(PILOT_FILE, "utf8")) as { attestationId: string };

const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const provider = new JsonRpcProvider(rpc, 1874, { staticNetwork: true });
const registry = new Contract(REGISTRY, registryInterface, provider);
const [attestation, status, usable, block] = await Promise.all([
  registry.getAttestation(record.attestationId),
  registry.getAttestationStatus(record.attestationId),
  registry.isUsable(record.attestationId),
  provider.getBlock("latest"),
]);

console.log(`attestation_id=${record.attestationId}`);
console.log(`issuer=${attestation.issuer}`);
console.log(`subject_id=${attestation.subjectId}`);
console.log(`issued_at=${attestation.issuedAt}`);
console.log(`expires_at=${attestation.expiresAt}`);
console.log(`revoked_at=${attestation.revokedAt}`);
console.log(`attestation_status=${status}`);
console.log(`usable=${usable}`);
console.log(`chain_timestamp=${block?.timestamp ?? 0}`);
