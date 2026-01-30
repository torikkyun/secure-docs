# API Documentation

## Authentication APIs

### POST /api/auth/register

- **Description**: Đăng ký tài khoản mới
- **Access**: Public
- **Request Body**: `RegisterDto`

### POST /api/auth/login

- **Description**: Đăng nhập
- **Access**: Public
- **Request Body**: `LoginDto`

### POST /api/auth/verify-passcode

- **Description**: Xác thực passcode
- **Access**: Protected (Bearer Token)
- **Request Body**: `VerifyPasscodeDto`

---

## User APIs

### GET /api/users/profile

- **Description**: Lấy thông tin profile của user hiện tại
- **Access**: Protected (Bearer Token)

### PATCH /api/users/profile

- **Description**: Cập nhật profile
- **Access**: Protected (Bearer Token)
- **Request Body**: `UpdateProfileDto`

### GET /api/users

- **Description**: Lấy danh sách users
- **Access**: Protected (Bearer Token)
- **Query Parameters**: `QueryUserDto`

### GET /api/users/:userId

- **Description**: Lấy thông tin user theo ID
- **Access**: Protected (Bearer Token)
- **Path Parameters**: `userId` (string)

---

## File APIs

### POST /api/files/upload

- **Description**: Upload files (tối đa 10 files, mỗi file tối đa 50MB)
- **Access**: Protected (Bearer Token)
- **Request**: Multipart form-data
  - `file`: File(s) để upload
  - Body: `UploadFilesDto`

### GET /api/files

- **Description**: Lấy danh sách files của user
- **Access**: Protected (Bearer Token)
- **Query Parameters**: `QueryFileDto`

### GET /api/files/:fileId

- **Description**: Lấy thông tin chi tiết file
- **Access**: Protected (Bearer Token)
- **Path Parameters**: `fileId` (string)

### GET /api/files/:fileId/download

- **Description**: Lấy thông tin file để download
- **Access**: Protected (Bearer Token)
- **Path Parameters**: `fileId` (string)

### GET /api/files/:fileId/stream

- **Description**: Download file dạng stream
- **Access**: Protected (Bearer Token)
- **Path Parameters**: `fileId` (string)

### DELETE /api/files/:fileId

- **Description**: Xóa file
- **Access**: Protected (Bearer Token)
- **Path Parameters**: `fileId` (string)

---

## Share APIs

### POST /api/shares

- **Description**: Tạo chia sẻ file
- **Access**: Protected (Bearer Token)
- **Request Body**: `CreateShareDto`

---

## File Activity APIs

### GET /api/file-activity/user

- **Description**: Lấy tất cả hoạt động file của user hiện tại (UPLOAD, SHARE, DOWNLOAD, DELETE, REVOKE_SHARE)
- **Access**: Protected (Bearer Token)
- **Query Parameters**: `QueryFileActivityDto`
  - `page` (number, optional): Số trang, mặc định = 1
  - `limit` (number, optional): Số items mỗi trang, mặc định = 10
- **Response**: `PaginatedFileActivitiesDto`
  - `data`: Array of activities với thông tin chi tiết:
    - SHARE: Bao gồm danh sách recipients, shareCount, warnings
    - DOWNLOAD: Thông tin người tải file
    - UPLOAD: Thông tin file (filename, mimeType, size)
  - `total`: Tổng số activities
  - `page`: Trang hiện tại
  - `limit`: Số items mỗi trang
  - `totalPages`: Tổng số trang
  - `blockchainTxHash`: Transaction hash trên Sepolia (nếu có)

### GET /api/file-activity/file/:fileId

- **Description**: Lấy tất cả hoạt động của một file cụ thể (chỉ owner hoặc người được share mới có quyền xem)
- **Access**: Protected (Bearer Token)
- **Path Parameters**: `fileId` (string)
- **Query Parameters**: `QueryFileActivityDto`
  - `page` (number, optional): Số trang, mặc định = 1
  - `limit` (number, optional): Số items mỗi trang, mặc định = 10
- **Response**: `PaginatedFileActivitiesDto` (cấu trúc giống endpoint trên)
- **Errors**:
  - `400 Bad Request`: User không có quyền xem hoạt động của file này
  - `404 Not Found`: File không tồn tại
