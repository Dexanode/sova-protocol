import { expect } from "chai";
import { network } from "hardhat";
import type { SovaAttestationRegistry } from "../types/ethers-contracts/index.js";

const DAY = 24n * 60n * 60n;

describe("SovaAttestationRegistry", function () {
  async function deployFixture() {
    const { ethers } = await network.create();
    const [owner, issuer, subject, relayer, outsider, nextOwner] = await ethers.getSigners();
    const registry = (await ethers.deployContract("SovaAttestationRegistry", [
      owner.address,
    ])) as unknown as SovaAttestationRegistry;
    await registry.waitForDeployment();

    const schemaId = ethers.keccak256(ethers.toUtf8Bytes("sova.credit.v1"));
    const schemaMetadata = ethers.keccak256(ethers.toUtf8Bytes("ipfs://schema"));
    const issuerMetadata = ethers.keccak256(ethers.toUtf8Bytes("ipfs://issuer"));
    await registry.registerSchema(schemaId, schemaMetadata, 30n * DAY);
    await registry.authorizeIssuer(schemaId, issuer.address, 0, 0, issuerMetadata);

    const chainId = (await ethers.provider.getNetwork()).chainId;
    const subjectId = await registry.computeSubjectId(chainId, subject.address);
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("salted-payload"));

    async function input(nonceLabel = "nonce-1", lifetime = DAY) {
      const block = await ethers.provider.getBlock("latest");
      const issuedAt = BigInt(block!.timestamp);
      const authorization = await registry.issuerAuthorizations(schemaId, issuer.address);
      return {
        subjectId,
        schemaId,
        dataHash,
        issuedAt,
        expiresAt: issuedAt + lifetime,
        issuerEpoch: authorization.epoch,
        nonce: ethers.keccak256(ethers.toUtf8Bytes(nonceLabel)),
      };
    }

    async function idFor(attestationInput: Awaited<ReturnType<typeof input>>) {
      return registry.computeAttestationId(
        attestationInput.subjectId,
        attestationInput.schemaId,
        issuer.address,
        attestationInput.nonce,
      );
    }

    return {
      ethers,
      registry,
      owner,
      issuer,
      subject,
      relayer,
      outsider,
      nextOwner,
      schemaId,
      schemaMetadata,
      issuerMetadata,
      subjectId,
      dataHash,
      chainId,
      input,
      idFor,
    };
  }

  it("restricts immutable schema registration to the owner", async function () {
    const { registry, outsider, schemaId, schemaMetadata } = await deployFixture();

    await expect(
      registry.connect(outsider).registerSchema(schemaId, schemaMetadata, DAY),
    ).to.be.revertedWithCustomError(registry, "Unauthorized");
    await expect(
      registry.registerSchema(schemaId, schemaMetadata, DAY),
    ).to.be.revertedWithCustomError(registry, "SchemaAlreadyExists");
  });

  it("issues once and exposes an active attestation", async function () {
    const { registry, issuer, input, idFor } = await deployFixture();
    const claim = await input();
    const attestationId = await idFor(claim);

    await expect(registry.connect(issuer).attest(claim))
      .to.emit(registry, "AttestationIssued")
      .withArgs(
        attestationId,
        claim.subjectId,
        claim.schemaId,
        issuer.address,
        claim.dataHash,
        claim.issuedAt,
        claim.expiresAt,
        claim.issuerEpoch,
      );

    expect(await registry.getAttestationStatus(attestationId)).to.equal(1);
    expect(await registry.isUsable(attestationId)).to.equal(true);
    await expect(registry.connect(issuer).attest(claim)).to.be.revertedWithCustomError(
      registry,
      "AttestationAlreadyExists",
    );
  });

  it("rejects unauthorized issuers and schema-crossing authority", async function () {
    const { ethers, registry, outsider, issuer, schemaMetadata, input } = await deployFixture();
    await expect(registry.connect(outsider).attest(await input())).to.be.revertedWithCustomError(
      registry,
      "IssuerNotActive",
    );

    const otherSchema = ethers.keccak256(ethers.toUtf8Bytes("sova.other.v1"));
    await registry.registerSchema(otherSchema, schemaMetadata, DAY);
    const claim = { ...(await input("other-schema")), schemaId: otherSchema };
    await expect(registry.connect(issuer).attest(claim)).to.be.revertedWithCustomError(
      registry,
      "IssuerNotActive",
    );
  });

  it("derives expiry without mutating stored data", async function () {
    const { ethers, registry, issuer, input, idFor } = await deployFixture();
    const claim = await input("short-lived", 60n);
    const id = await idFor(claim);
    await registry.connect(issuer).attest(claim);

    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(claim.expiresAt)]);
    await ethers.provider.send("evm_mine", []);
    expect(await registry.getAttestationStatus(id)).to.equal(2);
    expect(await registry.isUsable(id)).to.equal(false);
  });

  it("derives issuer suspension and permanent revocation status", async function () {
    const { registry, issuer, schemaId, input, idFor } = await deployFixture();
    const claim = await input();
    const id = await idFor(claim);
    await registry.connect(issuer).attest(claim);

    await registry.suspendIssuer(schemaId, issuer.address);
    expect(await registry.getAttestationStatus(id)).to.equal(4);
    await registry.reactivateIssuer(schemaId, issuer.address);
    expect(await registry.getAttestationStatus(id)).to.equal(1);
    await registry.revokeIssuer(schemaId, issuer.address);
    expect(await registry.getAttestationStatus(id)).to.equal(6);
    await expect(
      registry.authorizeIssuer(schemaId, issuer.address, 0, 0, claim.dataHash),
    ).to.be.revertedWithCustomError(registry, "IssuerPermanentlyRevoked");
  });

  it("makes claims unusable when issuer authorization expires", async function () {
    const { ethers, registry, issuer, schemaId, issuerMetadata, input, idFor } =
      await deployFixture();
    await registry.revokeIssuer(schemaId, issuer.address);

    const replacementSchema = ethers.keccak256(ethers.toUtf8Bytes("sova.expiring.v1"));
    const schemaMetadata = ethers.keccak256(ethers.toUtf8Bytes("ipfs://expiring-schema"));
    await registry.registerSchema(replacementSchema, schemaMetadata, DAY);
    const block = await ethers.provider.getBlock("latest");
    const validUntil = BigInt(block!.timestamp) + 120n;
    await registry.authorizeIssuer(
      replacementSchema,
      issuer.address,
      0,
      validUntil,
      issuerMetadata,
    );
    const claim = { ...(await input("auth-expires")), schemaId: replacementSchema };
    const id = await registry.computeAttestationId(
      claim.subjectId,
      claim.schemaId,
      issuer.address,
      claim.nonce,
    );
    await registry.connect(issuer).attest(claim);
    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(validUntil)]);
    await ethers.provider.send("evm_mine", []);
    expect(await registry.getAttestationStatus(id)).to.equal(5);
    expect(await registry.isUsable(id)).to.equal(false);
  });

  it("does not revive old claims across issuer re-authorization epochs", async function () {
    const { registry, issuer, schemaId, issuerMetadata, input, idFor } = await deployFixture();
    const oldClaim = await input("authorization-epoch-1");
    const oldId = await idFor(oldClaim);
    await registry.connect(issuer).attest(oldClaim);

    await registry.authorizeIssuer(schemaId, issuer.address, 0, 0, issuerMetadata);
    const authorization = await registry.issuerAuthorizations(schemaId, issuer.address);
    expect(authorization.epoch).to.equal(2);
    expect(await registry.getAttestationStatus(oldId)).to.equal(5);
    expect(await registry.isUsable(oldId)).to.equal(false);

    await expect(registry.connect(issuer).attest({
      ...oldClaim,
      nonce: oldClaim.dataHash,
    })).to.be.revertedWithCustomError(registry, "IssuerNotActive");
    const currentClaim = await input("authorization-epoch-2");
    await registry.connect(issuer).attest(currentClaim);
    expect(await registry.getAttestationStatus(await idFor(currentClaim))).to.equal(1);
  });

  it("makes revocation issuer-only and irreversible", async function () {
    const { ethers, registry, issuer, outsider, input, idFor } = await deployFixture();
    const claim = await input();
    const id = await idFor(claim);
    const reason = ethers.keccak256(ethers.toUtf8Bytes("superseded"));
    await registry.connect(issuer).attest(claim);

    await expect(registry.connect(outsider).revoke(id, reason)).to.be.revertedWithCustomError(
      registry,
      "Unauthorized",
    );
    await registry.connect(issuer).revoke(id, reason);
    expect(await registry.getAttestationStatus(id)).to.equal(3);
    await expect(registry.connect(issuer).revoke(id, reason)).to.be.revertedWithCustomError(
      registry,
      "AttestationAlreadyRevoked",
    );
  });

  it("pauses only issuance, never revocation or reads", async function () {
    const { ethers, registry, issuer, input, idFor } = await deployFixture();
    const existing = await input("before-pause");
    const id = await idFor(existing);
    await registry.connect(issuer).attest(existing);
    await registry.setIssuancePaused(true);

    await expect(registry.connect(issuer).attest(await input("during-pause"))).to.be.revertedWithCustomError(
      registry,
      "IssuanceIsPaused",
    );
    expect((await registry.getAttestation(id)).issuer).to.equal(issuer.address);
    await registry.connect(issuer).revoke(id, ethers.keccak256(ethers.toUtf8Bytes("paused")));
    expect(await registry.getAttestationStatus(id)).to.equal(3);
  });

  it("accepts a domain-bound EIP-712 attestation through an untrusted relayer", async function () {
    const { registry, issuer, relayer, chainId, input, idFor } = await deployFixture();
    const claim = await input("relayed");
    const deadline = claim.issuedAt + 600n;
    const domain = {
      name: "SOVA Attestation Registry",
      version: "1",
      chainId,
      verifyingContract: await registry.getAddress(),
    };
    const types = {
      Attestation: [
        { name: "subjectId", type: "bytes32" },
        { name: "schemaId", type: "bytes32" },
        { name: "dataHash", type: "bytes32" },
        { name: "issuer", type: "address" },
        { name: "issuedAt", type: "uint64" },
        { name: "expiresAt", type: "uint64" },
        { name: "issuerEpoch", type: "uint64" },
        { name: "nonce", type: "bytes32" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const signature = await issuer.signTypedData(domain, types, {
      ...claim,
      issuer: issuer.address,
      deadline,
    });

    await registry.connect(relayer).attestBySig(claim, issuer.address, deadline, signature);
    expect(await registry.getAttestationStatus(await idFor(claim))).to.equal(1);
    await expect(
      registry.connect(relayer).attestBySig(claim, issuer.address, deadline, signature),
    ).to.be.revertedWithCustomError(registry, "AttestationAlreadyExists");
  });

  it("rejects modified or cross-registry EIP-712 signatures", async function () {
    const { ethers, registry, owner, issuer, relayer, chainId, input } = await deployFixture();
    const otherRegistry = await ethers.deployContract("SovaAttestationRegistry", [owner.address]);
    await otherRegistry.waitForDeployment();
    const claim = await input("domain-bound");
    const deadline = claim.issuedAt + 600n;
    const types = {
      Attestation: [
        { name: "subjectId", type: "bytes32" },
        { name: "schemaId", type: "bytes32" },
        { name: "dataHash", type: "bytes32" },
        { name: "issuer", type: "address" },
        { name: "issuedAt", type: "uint64" },
        { name: "expiresAt", type: "uint64" },
        { name: "issuerEpoch", type: "uint64" },
        { name: "nonce", type: "bytes32" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const signature = await issuer.signTypedData(
      {
        name: "SOVA Attestation Registry",
        version: "1",
        chainId,
        verifyingContract: await otherRegistry.getAddress(),
      },
      types,
      { ...claim, issuer: issuer.address, deadline },
    );

    await expect(
      registry.connect(relayer).attestBySig(claim, issuer.address, deadline, signature),
    ).to.be.revertedWithCustomError(registry, "InvalidSignature");
    const modified = { ...claim, dataHash: ethers.keccak256(ethers.toUtf8Bytes("modified")) };
    await expect(
      registry.connect(relayer).attestBySig(modified, issuer.address, deadline, signature),
    ).to.be.revertedWithCustomError(registry, "InvalidSignature");
  });

  it("accepts ERC-1271 contract issuers and rejects unapproved signatures", async function () {
    const {
      ethers,
      registry,
      relayer,
      schemaId,
      issuerMetadata,
      subjectId,
      dataHash,
      chainId,
    } = await deployFixture();
    const contractIssuer = await ethers.deployContract("MockERC1271Issuer");
    await contractIssuer.waitForDeployment();
    const issuerAddress = await contractIssuer.getAddress();
    await registry.authorizeIssuer(schemaId, issuerAddress, 0, 0, issuerMetadata);
    const authorization = await registry.issuerAuthorizations(schemaId, issuerAddress);
    const block = await ethers.provider.getBlock("latest");
    const issuedAt = BigInt(block!.timestamp);
    const claim = {
      subjectId,
      schemaId,
      dataHash,
      issuedAt,
      expiresAt: issuedAt + DAY,
      issuerEpoch: authorization.epoch,
      nonce: ethers.keccak256(ethers.toUtf8Bytes("erc1271-approved")),
    };
    const deadline = issuedAt + 600n;
    const domain = {
      name: "SOVA Attestation Registry",
      version: "1",
      chainId,
      verifyingContract: await registry.getAddress(),
    };
    const types = {
      Attestation: [
        { name: "subjectId", type: "bytes32" },
        { name: "schemaId", type: "bytes32" },
        { name: "dataHash", type: "bytes32" },
        { name: "issuer", type: "address" },
        { name: "issuedAt", type: "uint64" },
        { name: "expiresAt", type: "uint64" },
        { name: "issuerEpoch", type: "uint64" },
        { name: "nonce", type: "bytes32" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const value = { ...claim, issuer: issuerAddress, deadline };
    const digest = ethers.TypedDataEncoder.hash(domain, types, value);
    const approvedSignature = "0x123456";
    await contractIssuer.approve(digest, approvedSignature);

    await registry
      .connect(relayer)
      .attestBySig(claim, issuerAddress, deadline, approvedSignature);
    const id = await registry.computeAttestationId(
      subjectId,
      schemaId,
      issuerAddress,
      claim.nonce,
    );
    expect(await registry.getAttestationStatus(id)).to.equal(1);

    const rejectedClaim = {
      ...claim,
      nonce: ethers.keccak256(ethers.toUtf8Bytes("erc1271-rejected")),
    };
    await expect(
      registry.connect(relayer).attestBySig(rejectedClaim, issuerAddress, deadline, "0xdead"),
    ).to.be.revertedWithCustomError(registry, "InvalidSignature");
  });

  it("supports issuer-signed relayed revocation", async function () {
    const { ethers, registry, issuer, relayer, chainId, input, idFor } = await deployFixture();
    const claim = await input("revoke-relay");
    const id = await idFor(claim);
    const reason = ethers.keccak256(ethers.toUtf8Bytes("issuer-request"));
    await registry.connect(issuer).attest(claim);
    const deadline = claim.issuedAt + 600n;
    const signature = await issuer.signTypedData(
      {
        name: "SOVA Attestation Registry",
        version: "1",
        chainId,
        verifyingContract: await registry.getAddress(),
      },
      {
        Revocation: [
          { name: "attestationId", type: "bytes32" },
          { name: "reason", type: "bytes32" },
          { name: "deadline", type: "uint256" },
        ],
      },
      { attestationId: id, reason, deadline },
    );

    await registry.connect(relayer).revokeBySig(id, reason, deadline, signature);
    expect(await registry.getAttestationStatus(id)).to.equal(3);
  });

  it("enforces issuance clock skew and schema validity caps", async function () {
    const { registry, issuer, input } = await deployFixture();
    const stale = await input("stale");
    stale.issuedAt -= 301n;
    stale.expiresAt -= 301n;
    await expect(registry.connect(issuer).attest(stale)).to.be.revertedWithCustomError(
      registry,
      "InvalidTimestamp",
    );
    await expect(
      registry.connect(issuer).attest(await input("too-long", 31n * DAY)),
    ).to.be.revertedWithCustomError(registry, "InvalidValidityPeriod");
  });

  it("uses two-step ownership transfer", async function () {
    const { registry, outsider, nextOwner } = await deployFixture();
    await registry.transferOwnership(nextOwner.address);
    await expect(registry.connect(outsider).acceptOwnership()).to.be.revertedWithCustomError(
      registry,
      "Unauthorized",
    );
    await registry.connect(nextOwner).acceptOwnership();
    expect(await registry.owner()).to.equal(nextOwner.address);
  });

  it("marks existing claims unusable when their immutable schema is disabled", async function () {
    const { registry, issuer, schemaId, input, idFor } = await deployFixture();
    const claim = await input("schema-disabled");
    const id = await idFor(claim);
    await registry.connect(issuer).attest(claim);
    await registry.setSchemaActive(schemaId, false);
    expect(await registry.getAttestationStatus(id)).to.equal(7);
    expect(await registry.isUsable(id)).to.equal(false);
  });
});
