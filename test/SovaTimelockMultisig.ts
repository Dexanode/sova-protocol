import { expect } from "chai";
import { network } from "hardhat";
import type {
  SovaAttestationRegistry,
  SovaTimelockMultisig,
} from "../types/ethers-contracts/index.js";

describe("SovaTimelockMultisig", function () {
  async function deployFixture() {
    const { ethers } = await network.create();
    const [signer1, signer2, signer3, outsider] = await ethers.getSigners();
    const governance = (await ethers.deployContract("SovaTimelockMultisig", [
      [signer1.address, signer2.address, signer3.address],
      2,
      300,
    ])) as unknown as SovaTimelockMultisig;
    await governance.waitForDeployment();
    const registry = (await ethers.deployContract("SovaAttestationRegistry", [
      await governance.getAddress(),
    ])) as unknown as SovaAttestationRegistry;
    await registry.waitForDeployment();
    return { ethers, governance, registry, signer1, signer2, signer3, outsider };
  }

  it("requires two signers and the full delay before registry administration", async function () {
    const { ethers, governance, registry, signer1, signer2, signer3, outsider } =
      await deployFixture();
    const target = await registry.getAddress();
    const data = registry.interface.encodeFunctionData("setIssuancePaused", [true]);
    const salt = ethers.keccak256(ethers.toUtf8Bytes("pause-issuance-1"));
    const operationId = await governance.hashOperation(target, 0, data, salt);

    await governance.connect(signer1).propose(target, 0, data, salt);
    await expect(
      governance.connect(signer1).approve(operationId),
    ).to.be.revertedWithCustomError(governance, "AlreadyApproved");
    await expect(
      governance.connect(outsider).approve(operationId),
    ).to.be.revertedWithCustomError(governance, "UnauthorizedSigner");
    await expect(
      governance.connect(signer3).execute(target, 0, data, salt),
    ).to.be.revertedWithCustomError(governance, "InsufficientApprovals");

    await governance.connect(signer2).approve(operationId);
    await expect(
      governance.connect(signer3).execute(target, 0, data, salt),
    ).to.be.revertedWithCustomError(governance, "TimelockNotReady");
    await ethers.provider.send("evm_increaseTime", [300]);
    await ethers.provider.send("evm_mine", []);
    await expect(
      governance.connect(outsider).execute(target, 0, data, salt),
    ).to.be.revertedWithCustomError(governance, "UnauthorizedSigner");

    await governance.connect(signer3).execute(target, 0, data, salt);
    expect(await registry.issuancePaused()).to.equal(true);
    await expect(
      governance.connect(signer1).execute(target, 0, data, salt),
    ).to.be.revertedWithCustomError(governance, "OperationAlreadyExecuted");
  });

  it("rejects zero, duplicate, and impossible signer configurations", async function () {
    const { ethers } = await network.create();
    const [signer] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("SovaTimelockMultisig");
    await expect(
      ethers.deployContract("SovaTimelockMultisig", [[signer.address, signer.address], 2, 300]),
    ).to.be.revertedWithCustomError(factory, "InvalidConfiguration");
    await expect(
      ethers.deployContract("SovaTimelockMultisig", [[signer.address], 2, 300]),
    ).to.be.revertedWithCustomError(factory, "InvalidConfiguration");
  });
});
