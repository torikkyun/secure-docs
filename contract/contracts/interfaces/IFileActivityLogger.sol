// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title File Activity Logger Interface
 * @dev Interface for the FileActivityLogger smart contract
 */
interface IFileActivityLogger {
    struct FileShare {
        string fileId;
        address sender;
        address[] recipients;
        uint256 timestamp;
        uint256 blockNumber;
    }

    struct FileDownload {
        string fileId;
        address recipient;
        uint256 timestamp;
        uint256 blockNumber;
    }

    event FileShared(
        string indexed fileId,
        address indexed sender,
        address[] recipients,
        uint256 timestamp,
        uint256 blockNumber
    );

    event FileDownloaded(
        string indexed fileId,
        address indexed recipient,
        uint256 timestamp,
        uint256 blockNumber
    );

    function logFileShare(
        string calldata fileId,
        address sender,
        address[] calldata recipients
    ) external;

    function logFileDownload(
        string calldata fileId,
        address recipient
    ) external;

    function hasRecipientDownloaded(
        string calldata fileId,
        address recipient
    ) external view returns (bool hasDownloaded);

    function getFileShares(
        string calldata fileId
    ) external view returns (FileShare[] memory shares);

    function getFileDownloads(
        string calldata fileId
    ) external view returns (FileDownload[] memory downloads);

    function getShareCount(string calldata fileId) external view returns (uint256 count);

    function getDownloadCount(string calldata fileId) external view returns (uint256 count);

    function getDownloadRecipients(
        string calldata fileId
    ) external view returns (address[] memory recipients);

    function owner() external view returns (address);

    function deployedAt() external view returns (uint256);
}