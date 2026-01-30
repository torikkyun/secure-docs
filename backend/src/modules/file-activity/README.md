# File Activity API Documentation

## 📋 Tổng quan

API để theo dõi và truy vấn lịch sử hoạt động của file trong hệ thống.

## 🔐 Authentication

Tất cả endpoints yêu cầu JWT Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📍 Endpoints

### 1. Get User's File Activities

Lấy tất cả hoạt động file của user hiện tại.

**Endpoint:** `GET /api/file-activity/user`

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Số trang (min: 1) |
| `limit` | number | 20 | Số items mỗi trang (min: 1, max: 100) |

**Response:** `200 OK`

```typescript
{
  data: FileActivityDto[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

**Example Request:**

```bash
curl -X GET 'http://localhost:3000/api/file-activity/user?page=1&limit=20' \
  -H 'Authorization: Bearer <token>'
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "action": "SHARE",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://..."
      },
      "file": {
        "id": "uuid",
        "filename": "document.pdf",
        "mimeType": "application/pdf"
      },
      "recipients": [
        {
          "id": "uuid",
          "name": "Alice Smith",
          "email": "alice@example.com",
          "avatar": "https://..."
        },
        {
          "id": "uuid",
          "name": "Bob Johnson",
          "email": "bob@example.com",
          "avatar": "https://..."
        }
      ],
      "shareCount": 2,
      "blockchainTxHash": "0x1234...abcd",
      "createdAt": "2026-01-29T10:30:00.000Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    },
    {
      "id": "uuid",
      "action": "UPLOAD",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://..."
      },
      "file": {
        "id": "uuid",
        "filename": "report.docx",
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      "filename": "report.docx",
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "size": "2048576",
      "blockchainTxHash": null,
      "createdAt": "2026-01-29T09:15:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

### 2. Get File Activities

Lấy tất cả hoạt động của một file cụ thể (chỉ owner hoặc người được share mới xem được).

**Endpoint:** `GET /api/file-activity/file/:fileId`

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `fileId` | string (UUID) | ID của file cần xem hoạt động |

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Số trang (min: 1) |
| `limit` | number | 50 | Số items mỗi trang (min: 1, max: 100) |

**Response:** `200 OK` - Same structure as above

**Error Responses:**

- `400 Bad Request`: User không có quyền xem file này
- `404 Not Found`: File không tồn tại

**Example Request:**

```bash
curl -X GET 'http://localhost:3000/api/file-activity/file/abc123?page=1&limit=50' \
  -H 'Authorization: Bearer <token>'
```

---

## 📊 Activity Types

### 1. SHARE Activity

```typescript
{
  "action": "SHARE",
  "recipients": [UserInfoDto],  // Danh sách người nhận
  "shareCount": 3,              // Số người được share
  "warnings": [                 // Cảnh báo (nếu có)
    "Alice Smith (alice@example.com)"  // Đã được share trước đó
  ],
  "blockchainTxHash": "0x..."   // Tx hash trên blockchain (nếu enabled)
}
```

### 2. DOWNLOAD Activity

```typescript
{
  "action": "DOWNLOAD",
  "downloadedBy": UserInfoDto,  // Người tải file
  "filename": "document.pdf",   // Tên file
  "blockchainTxHash": "0x..."   // Tx hash trên blockchain (nếu enabled)
}
```

### 3. UPLOAD Activity

```typescript
{
  "action": "UPLOAD",
  "filename": "report.docx",
  "mimeType": "application/...",
  "size": "2048576",            // Size in bytes (string)
  "blockchainTxHash": null      // Upload không log blockchain
}
```

### 4. DELETE Activity

```typescript
{
  "action": "DELETE",
  // Base activity info only
}
```

### 5. REVOKE_SHARE Activity

```typescript
{
  "action": "REVOKE_SHARE",
  // Base activity info only
}
```

---

## 🔍 Frontend Usage Examples

### React Query (TanStack Query)

```typescript
// hooks/useUserFileActivities.ts
import { useQuery } from "@tanstack/react-query";

export function useUserFileActivities(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["user-file-activities", page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/file-activity/user?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    },
  });
}

// hooks/useFileActivities.ts
export function useFileActivities(fileId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ["file-activities", fileId, page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/file-activity/file/${fileId}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch file activities");
      return res.json();
    },
    enabled: !!fileId,
  });
}
```

### Display Components

```tsx
// components/FileActivityList.tsx
import { useFileActivities } from "@/hooks/useFileActivities";

export function FileActivityList({ fileId }: { fileId: string }) {
  const { data, isLoading } = useFileActivities(fileId);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      {data.data.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}

      <Pagination current={data.page} total={data.totalPages} />
    </div>
  );
}

// components/ActivityItem.tsx
function ActivityItem({ activity }: { activity: FileActivityDto }) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded">
      <Avatar src={activity.user.avatar} />

      <div className="flex-1">
        {activity.action === "SHARE" && (
          <>
            <p className="font-medium">
              {activity.user.name} shared with{" "}
              {activity.recipients.map((r) => r.name).join(", ")}
            </p>
            {activity.blockchainTxHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${activity.blockchainTxHash}`}
                target="_blank"
                className="text-blue-500 text-sm"
              >
                View on Sepolia ↗
              </a>
            )}
          </>
        )}

        {activity.action === "DOWNLOAD" && (
          <p className="font-medium">
            {activity.user.name} downloaded {activity.file.filename}
          </p>
        )}

        {activity.action === "UPLOAD" && (
          <p className="font-medium">
            {activity.user.name} uploaded {activity.filename}
          </p>
        )}
      </div>

      <time className="text-sm text-gray-500">
        {formatDate(activity.createdAt)}
      </time>
    </div>
  );
}
```

---

## 🎨 UI/UX Recommendations

### Activity Timeline

```
┌─────────────────────────────────────────────┐
│ 🟢 John Doe shared with Alice, Bob, Charlie │
│    document.pdf                             │
│    📊 3 recipients                          │
│    ⛓️  View on Sepolia                      │
│    🕐 2 hours ago                           │
├─────────────────────────────────────────────┤
│ 🔵 Alice Smith downloaded document.pdf     │
│    ⛓️  View on Sepolia                      │
│    🕐 1 hour ago                            │
├─────────────────────────────────────────────┤
│ 🟡 John Doe uploaded report.docx           │
│    📄 2.5 MB                                │
│    🕐 3 hours ago                           │
└─────────────────────────────────────────────┘
```

### Action Icons

- 🟢 **SHARE**: Green - Sharing icon
- 🔵 **DOWNLOAD**: Blue - Download icon
- 🟡 **UPLOAD**: Yellow - Upload icon
- 🔴 **DELETE**: Red - Trash icon
- 🟠 **REVOKE_SHARE**: Orange - Cancel icon

### Blockchain Badge

```tsx
{
  activity.blockchainTxHash && (
    <Badge variant="outline" className="gap-1">
      <SepoliaIcon />
      <a href={`https://sepolia.etherscan.io/tx/${activity.blockchainTxHash}`}>
        On-chain
      </a>
    </Badge>
  );
}
```

---

## 🎯 Key Features

✅ **Type-safe**: Full TypeScript support with proper DTOs
✅ **Pagination**: Efficient data loading
✅ **Recipient Details**: SHARE activities include full recipient info
✅ **Blockchain Tracking**: Show Etherscan links for on-chain activities
✅ **Access Control**: Only owner/recipients can view file activities
✅ **Performance**: Optimized queries with selective includes
✅ **Enriched Data**: Action-specific metadata automatically populated

---

## 📝 Notes

1. **Blockchain Logging**:
   - SHARE và DOWNLOAD activities có thể có `blockchainTxHash`
   - UPLOAD, DELETE, REVOKE_SHARE không log blockchain
   - Tx hash = `null` nếu blockchain logging disabled

2. **Recipients Info**:
   - SHARE activities tự động fetch thông tin đầy đủ của recipients
   - Không cần frontend query thêm

3. **Performance**:
   - Pagination mặc định: 20 items/page (user), 50 items/page (file)
   - Max limit: 100 items/page
   - Query được optimize với selective includes

4. **Access Control**:
   - User chỉ xem được activities của:
     - Files mình sở hữu
     - Files được share cho mình
