import { Contract, formatEther, JsonRpcProvider } from "ethers";
import { GOVERNANCE, REGISTRY, schemaId } from "./schema-governance.js";
import {
  ISSUER,
  VALID_UNTIL,
  issuerGovernanceInterface,
  issuerRegistryInterface,
  operationId,
  metadataHash,
} from "./issuer-governance.js";

const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const provider = new JsonRpcProvider(rpc, 1874, { staticNetwork: true });
const governance = new Contract(GOVERNANCE, issuerGovernanceInterface, provider);
const registry = new Contract(REGISTRY, issuerRegistryInterface, provider);
const [operation, authorization, balance, block] = await Promise.all([
  governance.operations(operationId),
  registry.issuerAuthorizations(schemaId, ISSUER),
  provider.getBalance(ISSUER),
  provider.getBlock("latest"),
]);

console.log(`issuer=${ISSUER}`);
console.log(`metadata_hash=${metadataHash}`);
console.log(`operation_id=${operationId}`);
console.log(`ready_at=${operation.readyAt}`);
console.log(`approvals=${operation.approvals}`);
console.log(`executed=${operation.executed}`);
console.log(`authorization_state=${authorization.state}`);
console.log(`authorization_epoch=${authorization.epoch}`);
console.log(`authorization_valid_until=${authorization.validUntil}`);
console.log(`planned_valid_until=${VALID_UNTIL}`);
console.log(`chain_timestamp=${block?.timestamp ?? 0}`);
console.log(`issuer_balance_wbt=${formatEther(balance)}`);
