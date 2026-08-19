import { Interface, JsonRpcProvider } from "ethers";
import { SOVA_REGISTRY_ADDRESS } from "../src/SovaReadClient.js";
import { RegistryIndex, type IndexedEvent } from "../src/indexer/RegistryIndex.js";

const DEPLOYMENT_BLOCK = 5_489_891;
const CONFIRMATIONS = 6;
const BLOCK_CHUNK_SIZE = 5_000;
const REORG_REWIND = 20;
const DATABASE = "indexer-data/whitechain-sepolia.sqlite";
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
const index = new RegistryIndex(DATABASE);
const previous = index.getIndexedThrough();
const syncFrom = Math.max(DEPLOYMENT_BLOCK, (previous ?? DEPLOYMENT_BLOCK) - REORG_REWIND + 1);
const logs = [];
for (let fromBlock = syncFrom; fromBlock <= finalizedBlock; fromBlock += BLOCK_CHUNK_SIZE) {
  const toBlock = Math.min(fromBlock + BLOCK_CHUNK_SIZE - 1, finalizedBlock);
  logs.push(
    ...(await provider.getLogs({
      address: SOVA_REGISTRY_ADDRESS,
      fromBlock,
      toBlock,
    })),
  );
}
const events: IndexedEvent[] = logs.flatMap((log) => {
  const parsed = registry.parseLog(log);
  if (parsed === null) return [];
  return [{
    blockNumber: log.blockNumber,
    blockHash: log.blockHash,
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

index.replaceFromBlock(syncFrom, events, finalizedBlock);
console.log(`indexed_through=${finalizedBlock}`);
console.log(`sync_from=${syncFrom}`);
console.log(`fetched_events=${events.length}`);
console.log(`stored_events=${index.countEvents()}`);
console.log(`database=${DATABASE}`);
index.close();
