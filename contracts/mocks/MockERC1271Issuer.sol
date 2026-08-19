// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC1271} from "../interfaces/IERC1271.sol";

/// @dev Test-only ERC-1271 issuer with explicitly approved digest/signature pairs.
contract MockERC1271Issuer is IERC1271 {
    bytes4 private constant MAGIC_VALUE = 0x1626ba7e;

    bytes32 public approvedDigest;
    bytes32 public approvedSignatureHash;

    function approve(bytes32 digest, bytes calldata signature) external {
        approvedDigest = digest;
        approvedSignatureHash = keccak256(signature);
    }

    function isValidSignature(bytes32 hash, bytes calldata signature)
        external
        view
        returns (bytes4 magicValue)
    {
        if (hash == approvedDigest && keccak256(signature) == approvedSignatureHash) {
            return MAGIC_VALUE;
        }
        return bytes4(0xffffffff);
    }
}
