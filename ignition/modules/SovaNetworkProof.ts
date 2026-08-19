import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SovaNetworkProofModule", (module) => {
  const networkProof = module.contract("SovaNetworkProof");

  return { networkProof };
});
