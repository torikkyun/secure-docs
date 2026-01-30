# File Activity Logger - Hardhat 3 Project

Hệ thống ghi log hoạt động chia sẻ và tải file bảo mật trên Blockchain sử dụng Hardhat 3 và Solidity.

## Tổng quan

Smart contract `FileActivityLogger` cung cấp nhật ký bất biến (immutable audit trail) cho các hoạt động chia sẻ và tải file trong hệ thống quản lý tài liệu bảo mật.

### Tính năng chính

- **Ghi log chia sẻ file**: Theo dõi người gửi và danh sách người nhận
- **Ghi log tải file**: Theo dõi việc tải file của từng người nhận
- **Kiểm tra trạng thái**: Xem người nhận nào đã tải file
- **Truy vấn lịch sử**: Lấy toàn bộ hoạt động của một file
- **Bảo mật**: Chỉ contract owner (backend) mới có thể ghi log

## Cài đặt

```bash
cd contract
pnpm install
```

## Sử dụng

### Chạy Tests

```bash
# Chạy tất cả tests
npx hardhat test

# Chạy riêng Solidity tests
npx hardhat test solidity

# Chạy riêng TypeScript tests
npx hardhat test nodejs
```

### Deploy Contract

#### Local Development

```bash
npx hardhat ignition deploy ignition/modules/FileActivityLogger.ts
```

#### Sepolia Testnet

Đầu tiên, cấu hình private key:

```bash
# Sử dụng hardhat-keystore
npx hardhat keystore set SEPOLIA_PRIVATE_KEY

# Hoặc set environment variable
export SEPOLIA_PRIVATE_KEY=your_private_key_here
```

Sau đó deploy:

```bash
npx hardhat ignition deploy --network sepolia ignition/modules/FileActivityLogger.ts
```

### Demo Script

Chạy script demo để xem các tính năng:

```bash
npx hardhat run scripts/demo-file-activities.ts
```

## API Reference

### Structs

```solidity
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
```

### Functions

#### Write Functions (chỉ owner)

```solidity
// Ghi log chia sẻ file
function logFileShare(string fileId, address sender, address[] recipients)

// Ghi log tải file
function logFileDownload(string fileId, address recipient)
```

#### Read Functions

```solidity
// Kiểm tra người nhận đã tải file chưa
function hasRecipientDownloaded(string fileId, address recipient) returns (bool)

// Lấy tất cả hoạt động chia sẻ của file
function getFileShares(string fileId) returns (FileShare[])

// Lấy tất cả hoạt động tải của file
function getFileDownloads(string fileId) returns (FileDownload[])

// Lấy số lần chia sẻ
function getShareCount(string fileId) returns (uint256)

// Lấy số lần tải
function getDownloadCount(string fileId) returns (uint256)

// Lấy danh sách người đã tải (unique)
function getDownloadRecipients(string fileId) returns (address[])
```

## Tích hợp với Backend

Contract được thiết kế để backend NestJS có thể dễ dàng tương tác qua Web3/Ethers.js:

```typescript
// Trong BlockchainService
async logFileShare(params: { fileId: string; senderId: string; recipientIds: string[] }) {
  // Convert userIds to addresses và gọi contract
  const addresses = await this.convertUserIdsToAddresses(params.recipientIds);
  await this.contract.logFileShare(params.fileId, params.senderId, addresses);
}

async getDownloadStatus(fileId: string, userId: string): Promise<boolean> {
  const address = await this.convertUserIdToAddress(userId);
  return await this.contract.hasRecipientDownloaded(fileId, address);
}
```

## Events

Contract emit các events để tracking:

```solidity
event FileShared(string indexed fileId, address indexed sender, address[] recipients, uint256 timestamp, uint256 blockNumber);
event FileDownloaded(string indexed fileId, address indexed recipient, uint256 timestamp, uint256 blockNumber);
```

## Bảo mật

- Chỉ contract owner (backend admin wallet) có thể ghi log
- Validation đầy đủ cho tất cả inputs
- Gas optimization cho bulk operations
- Immutable audit trail trên blockchain

## License

MIT
