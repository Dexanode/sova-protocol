import { expect } from "chai";
import { AbiCoder, hexlify, randomBytes } from "ethers";
import {
  SOVA_SCHEMA_ID,
  computeDataHash,
  computeSubjectId,
  verifyDisclosure,
} from "../src/SovaReadClient.js";

describe("SovaReadClient", function () {
  it("computes chain-scoped subject IDs deterministically", function () {
    const account = "0xee76b045CA9093e40F2a298B9e218c910614e815";
    expect(computeSubjectId(1874n, account)).to.equal(
      "0x6b87de87f71262f5873b1d3ccc9ae09e21fc55f83a4ca3af690e5703de0eb9e7",
    );
    expect(computeSubjectId(1n, account)).not.to.equal(computeSubjectId(1874n, account));
  });

  it("verifies a salted payload disclosure and rejects tampering", function () {
    const payload = AbiCoder.defaultAbiCoder().encode(["uint8", "string"], [1, "synthetic"]);
    const salt = hexlify(randomBytes(32));
    const dataHash = computeDataHash(SOVA_SCHEMA_ID, payload, salt);
    expect(verifyDisclosure(dataHash, SOVA_SCHEMA_ID, payload, salt)).to.equal(true);
    const modified = AbiCoder.defaultAbiCoder().encode(["uint8", "string"], [2, "synthetic"]);
    expect(verifyDisclosure(dataHash, SOVA_SCHEMA_ID, modified, salt)).to.equal(false);
  });
});
