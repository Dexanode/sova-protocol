import { readFileSync } from "node:fs";
import { AbiCoder, Interface, keccak256, toUtf8Bytes } from "ethers";

const CHAIN_ID = 1874n;
const GOVERNANCE = "0x43e6335B0930Ed35934d16eDe1be4c688E88c020";
const REGISTRY = "0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf";
const MAX_VALIDITY = 7_776_000n;

const schemaBytes = readFileSync("schemas/onchain-credit-performance-v1.canonical.json");
const schemaId = keccak256(schemaBytes);
const metadataHash = schemaId;
const salt = keccak256(toUtf8Bytes(`SOVA_SCHEMA_ACTIVATION_V1:${schemaId}`));

const registry = new Interface([
  "function registerSchema(bytes32 schemaId, bytes32 metadataHash, uint64 maxValidity)",
]);
const governance = new Interface([
  "function propose(address target,uint256 value,bytes data,bytes32 salt)",
  "function approve(bytes32 operationId)",
  "function execute(address target,uint256 value,bytes data,bytes32 salt)",
]);

const data = registry.encodeFunctionData("registerSchema", [schemaId, metadataHash, MAX_VALIDITY]);
const operationId = keccak256(
  AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address", "address", "uint256", "bytes", "bytes32"],
    [CHAIN_ID, GOVERNANCE, REGISTRY, 0n, data, salt],
  ),
);

const output = {
  chainId: CHAIN_ID.toString(),
  governance: GOVERNANCE,
  registry: REGISTRY,
  schemaFile: "schemas/onchain-credit-performance-v1.canonical.json",
  schemaBytes: schemaBytes.length,
  schemaId,
  metadataHash,
  maxValidity: MAX_VALIDITY.toString(),
  target: REGISTRY,
  value: "0",
  data,
  salt,
  operationId,
  transactions: {
    propose: {
      to: GOVERNANCE,
      data: governance.encodeFunctionData("propose", [REGISTRY, 0n, data, salt]),
    },
    approve: {
      to: GOVERNANCE,
      data: governance.encodeFunctionData("approve", [operationId]),
    },
    execute: {
      to: GOVERNANCE,
      data: governance.encodeFunctionData("execute", [REGISTRY, 0n, data, salt]),
    },
  },
};

console.log(JSON.stringify(output, null, 2));
