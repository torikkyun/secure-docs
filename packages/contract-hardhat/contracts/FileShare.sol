// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract FileShare {
    event FileShared(
        address indexed sender,
        address indexed receiver,
        string cid,
        uint256 timestamp
    );

    function shareFile(address receiver, string memory cid) public {
        emit FileShared(msg.sender, receiver, cid, block.timestamp);
    }
}
