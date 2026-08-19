// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC1271} from "./interfaces/IERC1271.sol";

/// @title SOVA Attestation Registry
/// @notice Schema-bound, issuer-authorized attestations for onchain reputation.
/// @dev Evidence stays offchain. The registry stores commitments and lifecycle state only.
contract SovaAttestationRegistry {
    enum IssuerState {
        NONE,
        ACTIVE,
        SUSPENDED,
        REVOKED
    }

    enum AttestationStatus {
        NONE,
        ACTIVE,
        EXPIRED,
        REVOKED,
        ISSUER_SUSPENDED,
        ISSUER_INACTIVE,
        ISSUER_REVOKED,
        SCHEMA_INACTIVE
    }

    struct Schema {
        bytes32 metadataHash;
        uint64 maxValidity;
        bool active;
        bool exists;
    }

    struct IssuerAuthorization {
        bytes32 metadataHash;
        uint64 validFrom;
        uint64 validUntil;
        uint64 epoch;
        IssuerState state;
    }

    struct AttestationInput {
        bytes32 subjectId;
        bytes32 schemaId;
        bytes32 dataHash;
        uint64 issuedAt;
        uint64 expiresAt;
        uint64 issuerEpoch;
        bytes32 nonce;
    }

    struct Attestation {
        bytes32 subjectId;
        bytes32 schemaId;
        bytes32 dataHash;
        address issuer;
        uint64 issuedAt;
        uint64 expiresAt;
        uint64 issuerEpoch;
        uint64 revokedAt;
        bytes32 revocationReason;
    }

    bytes32 public constant ATTESTATION_TYPEHASH = keccak256(
        "Attestation(bytes32 subjectId,bytes32 schemaId,bytes32 dataHash,address issuer,uint64 issuedAt,uint64 expiresAt,uint64 issuerEpoch,bytes32 nonce,uint256 deadline)"
    );
    bytes32 public constant REVOCATION_TYPEHASH =
        keccak256("Revocation(bytes32 attestationId,bytes32 reason,uint256 deadline)");
    bytes32 public constant SUBJECT_DOMAIN = keccak256("SOVA_SUBJECT_V1");
    bytes32 public constant ATTESTATION_DOMAIN = keccak256("SOVA_ATTESTATION_V1");
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    bytes32 private constant NAME_HASH = keccak256("SOVA Attestation Registry");
    bytes32 private constant VERSION_HASH = keccak256("1");
    bytes4 private constant EIP1271_MAGIC_VALUE = 0x1626ba7e;
    uint256 private constant SECP256K1N_DIV_2 =
        0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;

    uint64 public constant MAX_CLOCK_SKEW = 5 minutes;

    address public owner;
    address public pendingOwner;
    bool public issuancePaused;

    mapping(bytes32 => Schema) public schemas;
    mapping(bytes32 => mapping(address => IssuerAuthorization)) public issuerAuthorizations;
    mapping(bytes32 => Attestation) private _attestations;

    error Unauthorized();
    error ZeroAddress();
    error InvalidSchema();
    error SchemaAlreadyExists();
    error SchemaInactive();
    error InvalidValidityPeriod();
    error InvalidIssuerAuthorization();
    error IssuerPermanentlyRevoked();
    error IssuerNotActive();
    error IssuanceIsPaused();
    error InvalidTimestamp();
    error AttestationAlreadyExists();
    error AttestationNotFound();
    error AttestationAlreadyRevoked();
    error SignatureExpired();
    error InvalidSignature();

    event OwnershipTransferStarted(address indexed currentOwner, address indexed pendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event IssuancePauseSet(bool paused);
    event SchemaRegistered(bytes32 indexed schemaId, bytes32 metadataHash, uint64 maxValidity);
    event SchemaActiveSet(bytes32 indexed schemaId, bool active);
    event IssuerAuthorizationSet(
        bytes32 indexed schemaId,
        address indexed issuer,
        IssuerState state,
        uint64 validFrom,
        uint64 validUntil,
        uint64 epoch,
        bytes32 metadataHash
    );
    event AttestationIssued(
        bytes32 indexed attestationId,
        bytes32 indexed subjectId,
        bytes32 indexed schemaId,
        address issuer,
        bytes32 dataHash,
        uint64 issuedAt,
        uint64 expiresAt,
        uint64 issuerEpoch
    );
    event AttestationRevoked(
        bytes32 indexed attestationId,
        address indexed issuer,
        bytes32 indexed reason,
        uint64 revokedAt
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert Unauthorized();
        address previousOwner = owner;
        owner = msg.sender;
        pendingOwner = address(0);
        emit OwnershipTransferred(previousOwner, msg.sender);
    }

    function setIssuancePaused(bool paused) external onlyOwner {
        issuancePaused = paused;
        emit IssuancePauseSet(paused);
    }

    function registerSchema(bytes32 schemaId, bytes32 metadataHash, uint64 maxValidity) external onlyOwner {
        if (schemaId == bytes32(0) || metadataHash == bytes32(0)) revert InvalidSchema();
        if (maxValidity == 0) revert InvalidValidityPeriod();
        if (schemas[schemaId].exists) revert SchemaAlreadyExists();

        schemas[schemaId] = Schema({
            metadataHash: metadataHash,
            maxValidity: maxValidity,
            active: true,
            exists: true
        });
        emit SchemaRegistered(schemaId, metadataHash, maxValidity);
    }

    function setSchemaActive(bytes32 schemaId, bool active) external onlyOwner {
        if (!schemas[schemaId].exists) revert InvalidSchema();
        schemas[schemaId].active = active;
        emit SchemaActiveSet(schemaId, active);
    }

    function authorizeIssuer(
        bytes32 schemaId,
        address issuer,
        uint64 validFrom,
        uint64 validUntil,
        bytes32 metadataHash
    ) external onlyOwner {
        Schema memory schema = schemas[schemaId];
        if (!schema.exists) revert InvalidSchema();
        if (issuer == address(0) || metadataHash == bytes32(0)) revert InvalidIssuerAuthorization();
        if (validUntil != 0 && validUntil <= validFrom) revert InvalidIssuerAuthorization();

        IssuerAuthorization storage current = issuerAuthorizations[schemaId][issuer];
        if (current.state == IssuerState.REVOKED) revert IssuerPermanentlyRevoked();
        uint64 nextEpoch = current.epoch + 1;
        issuerAuthorizations[schemaId][issuer] = IssuerAuthorization({
            metadataHash: metadataHash,
            validFrom: validFrom,
            validUntil: validUntil,
            epoch: nextEpoch,
            state: IssuerState.ACTIVE
        });
        emit IssuerAuthorizationSet(
            schemaId, issuer, IssuerState.ACTIVE, validFrom, validUntil, nextEpoch, metadataHash
        );
    }

    function suspendIssuer(bytes32 schemaId, address issuer) external onlyOwner {
        IssuerAuthorization storage authorization = issuerAuthorizations[schemaId][issuer];
        if (authorization.state != IssuerState.ACTIVE) revert InvalidIssuerAuthorization();
        authorization.state = IssuerState.SUSPENDED;
        emit IssuerAuthorizationSet(
            schemaId,
            issuer,
            IssuerState.SUSPENDED,
            authorization.validFrom,
            authorization.validUntil,
            authorization.epoch,
            authorization.metadataHash
        );
    }

    function reactivateIssuer(bytes32 schemaId, address issuer) external onlyOwner {
        IssuerAuthorization storage authorization = issuerAuthorizations[schemaId][issuer];
        if (authorization.state != IssuerState.SUSPENDED) revert InvalidIssuerAuthorization();
        authorization.state = IssuerState.ACTIVE;
        emit IssuerAuthorizationSet(
            schemaId,
            issuer,
            IssuerState.ACTIVE,
            authorization.validFrom,
            authorization.validUntil,
            authorization.epoch,
            authorization.metadataHash
        );
    }

    function revokeIssuer(bytes32 schemaId, address issuer) external onlyOwner {
        IssuerAuthorization storage authorization = issuerAuthorizations[schemaId][issuer];
        if (
            authorization.state != IssuerState.ACTIVE
                && authorization.state != IssuerState.SUSPENDED
        ) revert InvalidIssuerAuthorization();
        authorization.state = IssuerState.REVOKED;
        emit IssuerAuthorizationSet(
            schemaId,
            issuer,
            IssuerState.REVOKED,
            authorization.validFrom,
            authorization.validUntil,
            authorization.epoch,
            authorization.metadataHash
        );
    }

    function attest(AttestationInput calldata input) external returns (bytes32 attestationId) {
        return _attest(input, msg.sender);
    }

    function attestBySig(
        AttestationInput calldata input,
        address issuer,
        uint256 deadline,
        bytes calldata signature
    ) external returns (bytes32 attestationId) {
        if (block.timestamp > deadline) revert SignatureExpired();
        bytes32 structHash = keccak256(
            abi.encode(
                ATTESTATION_TYPEHASH,
                input.subjectId,
                input.schemaId,
                input.dataHash,
                issuer,
                input.issuedAt,
                input.expiresAt,
                input.issuerEpoch,
                input.nonce,
                deadline
            )
        );
        if (!_isValidSignature(issuer, _hashTypedData(structHash), signature)) revert InvalidSignature();
        return _attest(input, issuer);
    }

    function revoke(bytes32 attestationId, bytes32 reason) external {
        Attestation storage attestation = _attestations[attestationId];
        if (attestation.issuer == address(0)) revert AttestationNotFound();
        if (attestation.issuer != msg.sender) revert Unauthorized();
        _revoke(attestationId, attestation, reason);
    }

    function revokeBySig(
        bytes32 attestationId,
        bytes32 reason,
        uint256 deadline,
        bytes calldata signature
    ) external {
        if (block.timestamp > deadline) revert SignatureExpired();
        Attestation storage attestation = _attestations[attestationId];
        if (attestation.issuer == address(0)) revert AttestationNotFound();
        bytes32 structHash = keccak256(abi.encode(REVOCATION_TYPEHASH, attestationId, reason, deadline));
        if (!_isValidSignature(attestation.issuer, _hashTypedData(structHash), signature)) {
            revert InvalidSignature();
        }
        _revoke(attestationId, attestation, reason);
    }

    function getAttestation(bytes32 attestationId) external view returns (Attestation memory) {
        Attestation memory attestation = _attestations[attestationId];
        if (attestation.issuer == address(0)) revert AttestationNotFound();
        return attestation;
    }

    function getAttestationStatus(bytes32 attestationId) public view returns (AttestationStatus) {
        Attestation memory attestation = _attestations[attestationId];
        if (attestation.issuer == address(0)) return AttestationStatus.NONE;
        if (attestation.revokedAt != 0) return AttestationStatus.REVOKED;
        if (block.timestamp >= attestation.expiresAt) return AttestationStatus.EXPIRED;

        Schema memory schema = schemas[attestation.schemaId];
        if (!schema.active) return AttestationStatus.SCHEMA_INACTIVE;

        IssuerAuthorization memory authorization =
            issuerAuthorizations[attestation.schemaId][attestation.issuer];
        if (authorization.state == IssuerState.SUSPENDED) {
            return AttestationStatus.ISSUER_SUSPENDED;
        }
        if (authorization.state == IssuerState.REVOKED || authorization.state == IssuerState.NONE) {
            return AttestationStatus.ISSUER_REVOKED;
        }
        if (attestation.issuerEpoch != authorization.epoch) {
            return AttestationStatus.ISSUER_INACTIVE;
        }
        if (
            block.timestamp < authorization.validFrom
                || (authorization.validUntil != 0 && block.timestamp >= authorization.validUntil)
        ) return AttestationStatus.ISSUER_INACTIVE;
        return AttestationStatus.ACTIVE;
    }

    function isUsable(bytes32 attestationId) external view returns (bool) {
        return getAttestationStatus(attestationId) == AttestationStatus.ACTIVE;
    }

    function computeSubjectId(uint256 chainId, address account) external pure returns (bytes32) {
        return keccak256(abi.encode(SUBJECT_DOMAIN, chainId, account));
    }

    function computeAttestationId(
        bytes32 subjectId,
        bytes32 schemaId,
        address issuer,
        bytes32 nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(ATTESTATION_DOMAIN, subjectId, schemaId, issuer, nonce));
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparator();
    }

    function _attest(AttestationInput calldata input, address issuer)
        private
        returns (bytes32 attestationId)
    {
        if (issuancePaused) revert IssuanceIsPaused();
        Schema memory schema = schemas[input.schemaId];
        if (!schema.exists) revert InvalidSchema();
        if (!schema.active) revert SchemaInactive();
        IssuerAuthorization memory authorization = issuerAuthorizations[input.schemaId][issuer];
        if (!_isIssuerActive(authorization) || input.issuerEpoch != authorization.epoch) {
            revert IssuerNotActive();
        }
        if (input.subjectId == bytes32(0) || input.dataHash == bytes32(0)) revert InvalidSchema();

        uint256 issuedAt = input.issuedAt;
        uint256 currentTime = block.timestamp;
        uint256 difference = issuedAt > currentTime ? issuedAt - currentTime : currentTime - issuedAt;
        if (difference > MAX_CLOCK_SKEW) revert InvalidTimestamp();
        if (input.expiresAt <= input.issuedAt) revert InvalidValidityPeriod();
        if (uint256(input.expiresAt) - issuedAt > schema.maxValidity) revert InvalidValidityPeriod();

        attestationId = computeAttestationId(input.subjectId, input.schemaId, issuer, input.nonce);
        if (_attestations[attestationId].issuer != address(0)) revert AttestationAlreadyExists();
        _attestations[attestationId] = Attestation({
            subjectId: input.subjectId,
            schemaId: input.schemaId,
            dataHash: input.dataHash,
            issuer: issuer,
            issuedAt: input.issuedAt,
            expiresAt: input.expiresAt,
            issuerEpoch: input.issuerEpoch,
            revokedAt: 0,
            revocationReason: bytes32(0)
        });
        emit AttestationIssued(
            attestationId,
            input.subjectId,
            input.schemaId,
            issuer,
            input.dataHash,
            input.issuedAt,
            input.expiresAt,
            input.issuerEpoch
        );
    }

    function _revoke(bytes32 attestationId, Attestation storage attestation, bytes32 reason) private {
        if (attestation.revokedAt != 0) revert AttestationAlreadyRevoked();
        attestation.revokedAt = uint64(block.timestamp);
        attestation.revocationReason = reason;
        emit AttestationRevoked(attestationId, attestation.issuer, reason, uint64(block.timestamp));
    }

    function _isIssuerActive(IssuerAuthorization memory authorization) private view returns (bool) {
        if (authorization.state != IssuerState.ACTIVE) return false;
        if (block.timestamp < authorization.validFrom) return false;
        if (authorization.validUntil != 0 && block.timestamp >= authorization.validUntil) return false;
        return true;
    }

    function _hashTypedData(bytes32 structHash) private view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", _domainSeparator(), structHash));
    }

    function _domainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(EIP712_DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, address(this))
        );
    }

    function _isValidSignature(address signer, bytes32 digest, bytes calldata signature)
        private
        view
        returns (bool)
    {
        if (signer.code.length != 0) {
            try IERC1271(signer).isValidSignature(digest, signature) returns (bytes4 magicValue) {
                return magicValue == EIP1271_MAGIC_VALUE;
            } catch {
                return false;
            }
        }
        if (signature.length != 65) return false;
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        if (uint256(s) > SECP256K1N_DIV_2 || (v != 27 && v != 28)) return false;
        return ecrecover(digest, v, r, s) == signer;
    }
}
