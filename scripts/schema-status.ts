import { Contract, formatEther, JsonRpcProvider } from "ethers";
import {
  GOVERNANCE,
  REGISTRY,
  governanceInterface,
  operationId,
  registryInterface,
  schemaId,
  SIGNER_1,
  SIGNER_2,
} from "./schema-governance.js";

const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const provider = new JsonRpcProvider(rpc, 1874, { staticNetwork: true });
const governance = new Contract(GOVERNANCE, governanceInterface, provider);
const registry = new Contract(REGISTRY, registryInterface, provider);
const [operation, schema, block, signer1Balance, signer2Balance] = await Promise.all([
  governance.operations(operationId),
  registry.schemas(schemaId),
  provider.getBlock("latest"),
  provider.getBalance(SIGNER_1),
  provider.getBalance(SIGNER_2),
]);

console.log(`operation_id=${operationId}`);
console.log(`ready_at=${operation.readyAt}`);
console.log(`approvals=${operation.approvals}`);
console.log(`executed=${operation.executed}`);
console.log(`schema_id=${schemaId}`);
console.log(`schema_exists=${schema.exists}`);
console.log(`schema_active=${schema.active}`);
console.log(`chain_timestamp=${block?.timestamp ?? 0}`);
console.log(`signer_1_balance_wbt=${formatEther(signer1Balance)}`);
console.log(`signer_2_balance_wbt=${formatEther(signer2Balance)}`);
