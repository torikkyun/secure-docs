// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract FileShare {
    event FileShared(
        address indexed sender,
        address indexed receiver,
        string fileId,
        uint256 timestamp
    );

    event BatchFileShared(
        address indexed sender,
        string fileId,
        uint256 receiverCount,
        uint256 timestamp
    );

    // Share file to a single receiver
    function shareFile(address receiver, string memory fileId) public {
        require(receiver != address(0), "Invalid receiver address");
        require(bytes(fileId).length > 0, "File ID cannot be empty");

        emit FileShared(msg.sender, receiver, fileId, block.timestamp);
    }

    // Share file to multiple receivers at once
    function shareFileToMultiple(
        address[] memory receivers,
        string memory fileId
    ) public {
        require(receivers.length > 0, "Receivers array cannot be empty");
        require(bytes(fileId).length > 0, "File ID cannot be empty");

        for (uint256 i = 0; i < receivers.length; i++) {
            require(receivers[i] != address(0), "Invalid receiver address");
            emit FileShared(msg.sender, receivers[i], fileId, block.timestamp);
        }

        emit BatchFileShared(
            msg.sender,
            fileId,
            receivers.length,
            block.timestamp
        );
    }

    // Get current timestamp (helper function)
    function getCurrentTimestamp() public view returns (uint256) {
        return block.timestamp;
    }
}
