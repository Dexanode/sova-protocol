import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SovaAttestationRegistryModule", (module) => {
  const signer1 = module.getParameter("signer1");
  const signer2 = module.getParameter("signer2");
  const signer3 = module.getParameter("signer3");
  const threshold = module.getParameter("threshold", 2);
  const minDelay = module.getParameter("minDelay", 300);
  const governance = module.contract("SovaTimelockMultisig", [
    [signer1, signer2, signer3],
    threshold,
    minDelay,
  ]);
  const registry = module.contract("SovaAttestationRegistry", [governance]);

  return { governance, registry };
});
