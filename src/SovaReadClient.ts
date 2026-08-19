import {
  AbiCoder,
  Contract,
  type ContractRunner,
  getAddress,
  keccak256,
  toUtf8Bytes,
} from "ethers";

export const WHITECHAIN_SEPOLIA_CHAIN_ID = 1874n;
export const SOVA_REGISTRY_ADDRESS = "0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf";
export const SOVA_SCHEMA_ID =
  "0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526";
export const SUBJECT_DOMAIN = keccak256(toUtf8Bytes("SOVA_SUBJECT_V1"));

export enum AttestationStatus {
  NONE,
  ACTIVE,
  EXPIRED,
  REVOKED,
  ISSUER_SUSPENDED,
  ISSUER_INACTIVE,
  ISSUER_REVOKED,
  SCHEMA_INACTIVE,
}

const REGISTRY_ABI = [
  "function schemas(bytes32) view returns (bytes32 metadataHash,uint64 maxValidity,bool active,bool exists)",
  "function issuerAuthorizations(bytes32,address) view returns (bytes32 metadataHash,uint64 validFrom,uint64 validUntil,uint64 epoch,uint8 state)",
  "function getAttestation(bytes32) view returns (bytes32 subjectId,bytes32 schemaId,bytes32 dataHash,address issuer,uint64 issuedAt,uint64 expiresAt,uint64 issuerEpoch,uint64 revokedAt,bytes32 revocationReason)",
  "function getAttestationStatus(bytes32) view returns (uint8)",
  "function isUsable(bytes32) view returns (bool)",
] as const;

export function computeSubjectId(chainId: bigint, account: string): string {
  return keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256", "address"],
      [SUBJECT_DOMAIN, chainId, getAddress(account)],
    ),
  );
}

export function computeDataHash(schemaId: string, encodedPayload: string, salt: string): string {
  return keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes", "bytes32"],
      [schemaId, encodedPayload, salt],
    ),
  );
}

export function verifyDisclosure(
  expectedDataHash: string,
  schemaId: string,
  encodedPayload: string,
  salt: string,
): boolean {
  return computeDataHash(schemaId, encodedPayload, salt) === expectedDataHash.toLowerCase();
}

export class SovaReadClient {
  readonly registry: Contract;

  constructor(runner: ContractRunner, registryAddress = SOVA_REGISTRY_ADDRESS) {
    this.registry = new Contract(registryAddress, REGISTRY_ABI, runner);
  }

  async getAttestation(attestationId: string) {
    const [attestation, status, usable] = await Promise.all([
      this.registry.getAttestation(attestationId),
      this.registry.getAttestationStatus(attestationId),
      this.registry.isUsable(attestationId),
    ]);
    return {
      subjectId: attestation.subjectId as string,
      schemaId: attestation.schemaId as string,
      dataHash: attestation.dataHash as string,
      issuer: attestation.issuer as string,
      issuedAt: attestation.issuedAt as bigint,
      expiresAt: attestation.expiresAt as bigint,
      issuerEpoch: attestation.issuerEpoch as bigint,
      revokedAt: attestation.revokedAt as bigint,
      revocationReason: attestation.revocationReason as string,
      status: Number(status) as AttestationStatus,
      usable: usable as boolean,
    };
  }

  async getSchema(schemaId: string) {
    const schema = await this.registry.schemas(schemaId);
    return {
      metadataHash: schema.metadataHash as string,
      maxValidity: schema.maxValidity as bigint,
      active: schema.active as boolean,
      exists: schema.exists as boolean,
    };
  }

  async getIssuerAuthorization(schemaId: string, issuer: string) {
    const authorization = await this.registry.issuerAuthorizations(schemaId, issuer);
    return {
      metadataHash: authorization.metadataHash as string,
      validFrom: authorization.validFrom as bigint,
      validUntil: authorization.validUntil as bigint,
      epoch: authorization.epoch as bigint,
      state: Number(authorization.state),
    };
  }
}
