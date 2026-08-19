import { readFileSync } from "node:fs";

const EXPLORER = "https://explorer.testnet.whitechain.io";

const deployments = [
  {
    address: "0x43e6335B0930Ed35934d16eDe1be4c688E88c020",
    contractName: "project/contracts/SovaTimelockMultisig.sol:SovaTimelockMultisig",
    buildInfo:
      "ignition/deployments/chain-1874/build-info/solc-0_8_19-84f27b26621a214536c94b96d341a319349e9a3b.json",
  },
  {
    address: "0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf",
    contractName: "project/contracts/SovaAttestationRegistry.sol:SovaAttestationRegistry",
    buildInfo:
      "ignition/deployments/chain-1874/build-info/solc-0_8_19-971716e3edf60f25fed83cd434e2157c1d5d7e0b.json",
  },
] as const;

for (const deployment of deployments) {
  const buildInfo = JSON.parse(readFileSync(deployment.buildInfo, "utf8")) as {
    solcLongVersion: string;
    input: object;
  };
  const form = new FormData();
  form.set("compiler_version", buildInfo.solcLongVersion);
  form.set("contract_name", deployment.contractName);
  form.set(
    "files[0]",
    new Blob([JSON.stringify(buildInfo.input)], { type: "application/json" }),
    "standard-input.json",
  );

  const response = await fetch(
    `${EXPLORER}/api/v2/smart-contracts/${deployment.address}/verification/via/standard-input`,
    { method: "POST", body: form },
  );
  console.log(deployment.address, response.status, await response.text());
}
