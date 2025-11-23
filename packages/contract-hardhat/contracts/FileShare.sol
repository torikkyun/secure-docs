// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract FileShare {
    event FileShared(
        address indexed sender,
        address indexed receiver,
        string fileHash,
        uint256 timestamp
    );

    function shareFile(address receiver, string memory fileHash) public {
        emit FileShared(msg.sender, receiver, fileHash, block.timestamp);
    }
}
