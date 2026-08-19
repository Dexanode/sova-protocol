// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title SOVA Timelock Multisig
/// @notice Minimal fixed-signer governance executor for the SOVA testnet registry.
/// @dev Signers, threshold, and delay are immutable. Replace with independently
///      audited governance before a production deployment.
contract SovaTimelockMultisig {
    struct Operation {
        uint64 readyAt;
        uint64 approvals;
        bool executed;
    }

    uint64 public immutable minDelay;
    uint64 public immutable threshold;
    uint64 public immutable signerCount;

    mapping(address => bool) public isSigner;
    mapping(bytes32 => Operation) public operations;
    mapping(bytes32 => mapping(address => bool)) public hasApproved;

    error UnauthorizedSigner();
    error InvalidConfiguration();
    error OperationAlreadyExists();
    error OperationNotFound();
    error AlreadyApproved();
    error InsufficientApprovals();
    error TimelockNotReady();
    error OperationAlreadyExecuted();
    error ExecutionFailed(bytes returnData);

    event OperationProposed(
        bytes32 indexed operationId,
        address indexed proposer,
        address indexed target,
        uint256 value,
        bytes data,
        bytes32 salt,
        uint64 readyAt
    );
    event OperationApproved(bytes32 indexed operationId, address indexed signer, uint64 approvals);
    event OperationExecuted(bytes32 indexed operationId, address indexed executor, bytes returnData);

    modifier onlySigner() {
        if (!isSigner[msg.sender]) revert UnauthorizedSigner();
        _;
    }

    constructor(address[] memory signers, uint64 requiredApprovals, uint64 delaySeconds) {
        uint256 count = signers.length;
        if (count == 0 || requiredApprovals == 0 || requiredApprovals > count) {
            revert InvalidConfiguration();
        }
        for (uint256 index = 0; index < count; ++index) {
            address signer = signers[index];
            if (signer == address(0) || isSigner[signer]) revert InvalidConfiguration();
            isSigner[signer] = true;
        }
        signerCount = uint64(count);
        threshold = requiredApprovals;
        minDelay = delaySeconds;
    }

    receive() external payable {}

    function hashOperation(address target, uint256 value, bytes calldata data, bytes32 salt)
        public
        view
        returns (bytes32)
    {
        return keccak256(abi.encode(block.chainid, address(this), target, value, data, salt));
    }

    function propose(address target, uint256 value, bytes calldata data, bytes32 salt)
        external
        onlySigner
        returns (bytes32 operationId)
    {
        operationId = hashOperation(target, value, data, salt);
        if (operations[operationId].readyAt != 0) revert OperationAlreadyExists();
        uint64 readyAt = uint64(block.timestamp) + minDelay;
        operations[operationId] = Operation({readyAt: readyAt, approvals: 1, executed: false});
        hasApproved[operationId][msg.sender] = true;
        emit OperationProposed(operationId, msg.sender, target, value, data, salt, readyAt);
        emit OperationApproved(operationId, msg.sender, 1);
    }

    function approve(bytes32 operationId) external onlySigner {
        Operation storage operation = operations[operationId];
        if (operation.readyAt == 0) revert OperationNotFound();
        if (operation.executed) revert OperationAlreadyExecuted();
        if (hasApproved[operationId][msg.sender]) revert AlreadyApproved();
        hasApproved[operationId][msg.sender] = true;
        ++operation.approvals;
        emit OperationApproved(operationId, msg.sender, operation.approvals);
    }

    function execute(address target, uint256 value, bytes calldata data, bytes32 salt)
        external
        onlySigner
        returns (bytes memory returnData)
    {
        bytes32 operationId = hashOperation(target, value, data, salt);
        Operation storage operation = operations[operationId];
        if (operation.readyAt == 0) revert OperationNotFound();
        if (operation.executed) revert OperationAlreadyExecuted();
        if (operation.approvals < threshold) revert InsufficientApprovals();
        if (block.timestamp < operation.readyAt) revert TimelockNotReady();

        operation.executed = true;
        bool success;
        (success, returnData) = target.call{value: value}(data);
        if (!success) revert ExecutionFailed(returnData);
        emit OperationExecuted(operationId, msg.sender, returnData);
    }
}
