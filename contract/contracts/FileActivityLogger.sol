// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title File Activity Logger Smart Contract
 * @dev Logs file sharing and download activities on blockchain for secure document management
 * @notice This contract provides immutable audit trail for file operations
 */
contract FileActivityLogger {
    // Events - All data stored in events (cheap), not in storage (expensive)
    event FileShared(
        string indexed fileId,
        string sender,
        string[] recipients,
        uint256 timestamp
    );

    event FileDownloaded(
        string indexed fileId,
        string recipient,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    // Minimal state variables - only essential data
    mapping(string => mapping(string => bool)) private downloadStatus; // fileId => recipientEmail => hasDownloaded

    // Counters (cheaper than storing arrays)
    mapping(string => uint256) private shareCount;
    mapping(string => uint256) private downloadCount;
    uint256 private totalShareOperations;
    uint256 private totalDownloadOperations;

    // Contract metadata
    address public owner;
    uint256 public immutable deployedAt;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        deployedAt = block.timestamp;
    }

    /**
     * @dev Log a file share activity
     * @param fileId Unique identifier of the file
     * @param sender Email of the file sender/sharer
     * @param recipients Array of recipient emails
     */
    function logFileShare(
        string calldata fileId,
        string calldata sender,
        string[] calldata recipients
    ) external onlyOwner {
        require(bytes(fileId).length > 0, "FileId cannot be empty");
        require(bytes(sender).length > 0, "Sender email cannot be empty");
        require(recipients.length > 0, "Must have at least one recipient");

        // Validate recipient emails
        for (uint256 i = 0; i < recipients.length; i++) {
            require(bytes(recipients[i]).length > 0, "Recipient email cannot be empty");
        }

        // Update counters
        shareCount[fileId]++;
        totalShareOperations++;

        // Emit event (all data stored here, queryable from blockchain)
        emit FileShared(fileId, sender, recipients, block.timestamp);
    }

    /**
     * @dev Log a file download activity
     * @param fileId Unique identifier of the file
     * @param recipient Email of the recipient who downloaded
     */
    function logFileDownload(
        string calldata fileId,
        string calldata recipient
    ) external onlyOwner {
        require(bytes(fileId).length > 0, "FileId cannot be empty");
        require(bytes(recipient).length > 0, "Recipient email cannot be empty");

        // Update counters and status
        downloadCount[fileId]++;
        totalDownloadOperations++;
        downloadStatus[fileId][recipient] = true;

        // Emit event (all data stored here, queryable from blockchain)
        emit FileDownloaded(fileId, recipient, block.timestamp);
    }

    /**
     * @dev Check if a recipient has downloaded a specific file
     * @param fileId Unique identifier of the file
     * @param recipient Email of the recipient
     * @return hasDownloaded True if recipient has downloaded the file
     */
    function hasRecipientDownloaded(
        string calldata fileId,
        string calldata recipient
    ) external view returns (bool hasDownloaded) {
        return downloadStatus[fileId][recipient];
    }

    /**
     * @dev Get share count for a file
     * @param fileId Unique identifier of the file
     * @return count Number of times the file has been shared
     */
    function getShareCount(string calldata fileId) external view returns (uint256 count) {
        return shareCount[fileId];
    }

    /**
     * @dev Get download count for a file
     * @param fileId Unique identifier of the file
     * @return count Number of times the file has been downloaded
     */
    function getDownloadCount(string calldata fileId) external view returns (uint256 count) {
        return downloadCount[fileId];
    }

    /**
     * @dev Get contract statistics
     * @return totalShares Total number of share operations
     * @return totalDownloads Total number of download operations
     */
    function getContractStats() external view returns (
        uint256 totalShares,
        uint256 totalDownloads
    ) {
        return (totalShareOperations, totalDownloadOperations);
    }

    /**
     * @dev Transfer contract ownership to a new address
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        require(newOwner != owner, "New owner is the same as current owner");
        
        address previousOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(previousOwner, newOwner, block.timestamp);
    }
}