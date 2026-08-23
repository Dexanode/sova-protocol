import { JsonRpcProvider } from "ethers";
import {
  SOVA_REGISTRY_ADDRESS,
  SOVA_SCHEMA_ID,
  SovaReadClient,
  WHITECHAIN_SEPOLIA_CHAIN_ID,
} from "../src/SovaReadClient.js";
import { RegistryIndex } from "../src/indexer/RegistryIndex.js";
import { withTimeout } from "../src/api/ServiceControls.js";

const DATABASE = process.env.SOVA_INDEX_DATABASE ?? "indexer-data/whitechain-sepolia.sqlite";
const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const timeoutMs = Number(process.env.SOVA_RPC_TIMEOUT_MS ?? "8000");
const maxLag = Number(process.env.SOVA_MAX_INDEX_LAG_BLOCKS ?? "100");

if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new Error("Invalid SOVA_RPC_TIMEOUT_MS");
if (!Number.isInteger(maxLag) || maxLag < 1) throw new Error("Invalid SOVA_MAX_INDEX_LAG_BLOCKS");

const provider = new JsonRpcProvider(rpc, Number(WHITECHAIN_SEPOLIA_CHAIN_ID), {
  staticNetwork: true,
});
const client = new SovaReadClient(provider);
const index = new RegistryIndex(DATABASE);

try {
  const [network, chainHead, code, schema] = await withTimeout(Promise.all([
    provider.getNetwork(),
    provider.getBlockNumber(),
    provider.getCode(SOVA_REGISTRY_ADDRESS),
    client.getSchema(SOVA_SCHEMA_ID),
  ]), timeoutMs);
  const indexedThrough = index.getIndexedThrough();
  const lagBlocks = indexedThrough === undefined ? undefined : Math.max(chainHead - indexedThrough, 0);
  const checks = {
    chainId: network.chainId === WHITECHAIN_SEPOLIA_CHAIN_ID,
    registryCode: code !== "0x",
    schemaExists: schema.exists,
    schemaActive: schema.active,
    databaseIntegrity: index.integrityCheck(),
    indexCheckpoint: indexedThrough !== undefined,
    indexLag: lagBlocks !== undefined && lagBlocks <= maxLag,
  };
  const ok = Object.values(checks).every(Boolean);
  console.log(JSON.stringify({
    ok,
    chainId: network.chainId.toString(),
    registry: SOVA_REGISTRY_ADDRESS,
    chainHead,
    indexedThrough: indexedThrough ?? null,
    indexLagBlocks: lagBlocks ?? null,
    maxIndexLagBlocks: maxLag,
    eventCount: index.countEvents(),
    checks,
  }, null, 2));
  if (!ok) process.exitCode = 1;
} catch {
  console.error(JSON.stringify({ ok: false, error: "OPERATIONAL_CHECK_FAILED" }));
  process.exitCode = 1;
} finally {
  index.close();
  await provider.destroy();
}
