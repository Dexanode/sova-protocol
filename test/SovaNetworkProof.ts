import { expect } from "chai";
import { network } from "hardhat";

describe("SovaNetworkProof", function () {
  it("records an internally consistent deployment proof", async function () {
    const { ethers } = await network.create();
    const [deployer] = await ethers.getSigners();
    const contract = await ethers.deployContract("SovaNetworkProof");
    await contract.waitForDeployment();

    expect(await contract.PROJECT()).to.equal("SOVA");
    expect(await contract.VERSION()).to.equal("0.3");
    expect(await contract.deployer()).to.equal(deployer.address);
    expect(await contract.deploymentChainId()).to.equal(
      (await ethers.provider.getNetwork()).chainId,
    );
    expect(await contract.proof()).to.match(/^0x[0-9a-f]{64}$/i);
  });
});
