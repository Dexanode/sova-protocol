import { mkdirSync, writeFileSync } from "node:fs";
import { Interface, JsonRpcProvider } from "ethers";
import { SOVA_REGISTRY_ADDRESS } from "../src/SovaReadClient.js";

const DEPLOYMENT_BLOCK = 5_489_891;
const CONFIRMATIONS = 6;
const BLOCK_CHUNK_SIZE = 5_000;
const OUTPUT = "indexer-data/whitechain-sepolia.json";
const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const provider = new JsonRpcProvider(rpc, 1874, { staticNetwork: true });
const registry = new Interface([
  "event SchemaRegistered(bytes32 indexed schemaId,bytes32 metadataHash,uint64 maxValidity)",
  "event SchemaActiveSet(bytes32 indexed schemaId,bool active)",
  "event IssuerAuthorizationSet(bytes32 indexed schemaId,address indexed issuer,uint8 state,uint64 validFrom,uint64 validUntil,uint64 epoch,bytes32 metadataHash)",
  "event AttestationIssued(bytes32 indexed attestationId,bytes32 indexed subjectId,bytes32 indexed schemaId,address issuer,bytes32 dataHash,uint64 issuedAt,uint64 expiresAt,uint64 issuerEpoch)",
  "event AttestationRevoked(bytes32 indexed attestationId,address indexed issuer,bytes32 indexed reason,uint64 revokedAt)",
]);

const latest = await provider.getBlockNumber();
const finalizedBlock = latest - CONFIRMATIONS;
const logs = [];
for (let fromBlock = DEPLOYMENT_BLOCK; fromBlock <= finalizedBlock; fromBlock += BLOCK_CHUNK_SIZE) {
  const toBlock = Math.min(fromBlock + BLOCK_CHUNK_SIZE - 1, finalizedBlock);
  logs.push(
    ...(await provider.getLogs({
      address: SOVA_REGISTRY_ADDRESS,
      fromBlock,
      toBlock,
    })),
  );
}
const events = logs.flatMap((log) => {
  const parsed = registry.parseLog(log);
  if (parsed === null) return [];
  return [{
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
    logIndex: log.index,
    name: parsed.name,
    args: parsed.fragment.inputs.reduce<Record<string, string>>((result, input, index) => {
      const value = parsed.args[index] as unknown;
      result[input.name] = typeof value === "bigint" ? value.toString() : String(value);
      return result;
    }, {}),
  }];
});

const output = {
  version: 1,
  chainId: 1874,
  registry: SOVA_REGISTRY_ADDRESS,
  deploymentBlock: DEPLOYMENT_BLOCK,
  confirmations: CONFIRMATIONS,
  blockChunkSize: BLOCK_CHUNK_SIZE,
  indexedThrough: finalizedBlock,
  eventCount: events.length,
  events,
};
mkdirSync("indexer-data", { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`indexed_through=${finalizedBlock}`);
console.log(`event_count=${events.length}`);
console.log(`output=${OUTPUT}`);
