// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title SOVA Network Proof
/// @notice Minimal deployment marker used to prove SOVA's Whitechain integration.
/// @dev This is not the reputation registry. Product contracts will be introduced
///      only after their interfaces and threat model are finalized.
contract SovaNetworkProof {
    string public constant PROJECT = "SOVA";
    string public constant VERSION = "0.3";

    address public immutable deployer;
    uint256 public immutable deploymentChainId;
    uint256 public immutable deployedAtBlock;

    constructor() {
        deployer = msg.sender;
        deploymentChainId = block.chainid;
        deployedAtBlock = block.number;
    }

    function proof() external view returns (bytes32) {
        return keccak256(
            abi.encode(PROJECT, VERSION, deployer, deploymentChainId, deployedAtBlock, address(this))
        );
    }
}
