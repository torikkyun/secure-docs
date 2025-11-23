// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {FileShare} from "./FileShare.sol";

contract FileShareTest is Test {
    FileShare public fileShare;

    event FileShared(
        address indexed sender,
        address indexed receiver,
        string fileHash,
        uint256 timestamp
    );

    function setUp() public {
        fileShare = new FileShare();
    }

    function test_ShareFile() public {
        address receiver = address(0x123);
        string memory fileHash = "QmTestHash";

        vm.warp(1234567890);

        vm.expectEmit(true, true, false, true);
        emit FileShared(address(this), receiver, fileHash, 1234567890);

        fileShare.shareFile(receiver, fileHash);
    }
}
