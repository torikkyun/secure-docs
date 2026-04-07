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
        string recipient,
        uint256 expiresAt,
        uint256 timestamp
    );

    event FileDownloaded(
        string indexed fileId,
        string recipient,
        uint256 timestamp
    );

    event FileViewed(
        string indexed fileId,
        string viewer,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    // Minimal state variables - only essential data
    mapping(string => mapping(string => bool)) private downloadStatus; // fileId => recipientEmail => hasDownloaded
    mapping(string => mapping(string => uint256)) private shareExpiry; // fileId => recipientEmail => expiresAt (0 = no expiry)

    // Counters (cheaper than storing arrays)
    mapping(string => uint256) private shareCount;
    mapping(string => uint256) private downloadCount;
    mapping(string => uint256) private viewCount;
    uint256 private totalShareOperations;
    uint256 private totalDownloadOperations;
    uint256 private totalViewOperations;

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
     * @dev Log a file share activity for a single recipient
     * @param fileId Unique identifier of the file
     * @param sender Email of the file sender/sharer
     * @param recipient Email of the recipient
     * @param expiresAt Unix timestamp (seconds) when the share expires, 0 = no expiry
     */
    function logFileShare(
        string calldata fileId,
        string calldata sender,
        string calldata recipient,
        uint256 expiresAt
    ) external onlyOwner {
        require(bytes(fileId).length > 0, "FileId cannot be empty");
        require(bytes(sender).length > 0, "Sender email cannot be empty");
        require(bytes(recipient).length > 0, "Recipient email cannot be empty");
        require(
            expiresAt == 0 || expiresAt > block.timestamp,
            "Expiration must be in the future"
        );

        // Update counters and expiry
        shareCount[fileId]++;
        totalShareOperations++;
        shareExpiry[fileId][recipient] = expiresAt;

        // Emit event (all data stored here, queryable from blockchain)
        emit FileShared(fileId, sender, recipient, expiresAt, block.timestamp);
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
     * @dev Log a file view activity
     * @param fileId Unique identifier of the file
     * @param viewer Email of the user who viewed the file
     */
    function logFileView(
        string calldata fileId,
        string calldata viewer
    ) external onlyOwner {
        require(bytes(fileId).length > 0, "FileId cannot be empty");
        require(bytes(viewer).length > 0, "Viewer email cannot be empty");

        // Update counters
        viewCount[fileId]++;
        totalViewOperations++;

        // Emit event (all data stored here, queryable from blockchain)
        emit FileViewed(fileId, viewer, block.timestamp);
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
     * @dev Check if a share has expired for a specific recipient
     * @param fileId Unique identifier of the file
     * @param recipient Email of the recipient
     * @return True if the share has expired (always false when no expiry was set)
     */
    function isShareExpired(
        string calldata fileId,
        string calldata recipient
    ) external view returns (bool) {
        uint256 expiry = shareExpiry[fileId][recipient];
        if (expiry == 0) return false;
        return block.timestamp > expiry;
    }

    /**
     * @dev Get the expiry timestamp of a share for a specific recipient
     * @param fileId Unique identifier of the file
     * @param recipient Email of the recipient
     * @return expiresAt Unix timestamp (seconds), 0 means no expiry
     */
    function getShareExpiry(
        string calldata fileId,
        string calldata recipient
    ) external view returns (uint256 expiresAt) {
        return shareExpiry[fileId][recipient];
    }

    /**
     * @dev Get view count for a file
     * @param fileId Unique identifier of the file
     * @return count Number of times the file has been viewed
     */
    function getViewCount(string calldata fileId) external view returns (uint256 count) {
        return viewCount[fileId];
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
        uint256 totalDownloads,
        uint256 totalViews
    ) {
        return (totalShareOperations, totalDownloadOperations, totalViewOperations);
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
