# ĐẶC TẢ HỆ THỐNG CHIA SẺ FILE BẢO MẬT VỚI BLOCKCHAIN (FINAL VER.)

## 1. Tổng quan & Mục tiêu

* **Mục tiêu:** Xây dựng nền tảng chia sẻ tài liệu nội bộ doanh nghiệp với mô hình **Zero-Knowledge**.
* **Bảo mật:** Đảm bảo dữ liệu và khóa giải mã không bao giờ tồn tại ở dạng thô (plaintext) trên server.
* **Minh bạch:** Kết hợp nhật ký hệ thống nội bộ và bằng chứng không thể chối cãi trên Blockchain.

---

## 2. Danh mục Công nghệ (Techstack)

### 2.1. Nền tảng Phát triển

* **Backend:** NestJS (Node.js), Prisma ORM.
* **Database:** PostgreSQL.
* **Frontend (TanStack Powerhouse):**
* **Framework:** TanStack Start.
* **Routing & Logic:** TanStack Router, TanStack Query.
* **UI Management:** TanStack Table, TanStack Form, TanStack Store.


* **UI Components:** Shadcn UI.
* **Smart Contract:** Hardhat 3 (Solidity).

### 2.2. Công cụ Hỗ trợ (MCP)

* `shadcn`: Hệ thống thiết kế UI đồng nhất.
* `context7`: Quản lý ngữ cảnh dự án cho AI.

---

## 3. Cơ chế Bảo mật & Quản lý Định danh

### 3.1. Khởi tạo và Khôi phục (Mnemonic)

* **Mnemonic (12 từ):** Được sinh ra khi đăng ký, dùng để tái tạo cặp khóa **X25519**.
* **Local Storage:** Lưu trữ cặp khóa hiện tại (Private Key mã hóa bởi Passcode).
* **Cảnh báo đồng bộ (Key Sync Alert):**
* Nếu `Public_Key_LocalStorage`  `Public_Key_Database`: Hệ thống hiển thị Modal cảnh báo đỏ.
* **Yêu cầu:** Người dùng nhập 12 từ Mnemonic để khôi phục danh tính và ghi đè lại Local Storage.



### 3.2. Chốt chặn Passcode

* Mọi hành động nhạy cảm (**Upload, Download, Share**) đều yêu cầu nhập lại **Passcode**.
* Hành động này vừa để giải mã Private Key trong RAM, vừa để xác thực ý chí người dùng (chống spam/nhấn nhầm).

---

## 4. Quy trình Mã hóa & Key Wrapping (Cốt lõi)

Hệ thống sử dụng cơ chế bọc khóa để bảo vệ AES key của file:

### 4.1. Luồng Tải lên (Upload)

1. **Client:** Sinh ngẫu nhiên .
2. **Mã hóa File:** .
3. **Self-Wrapping:** .
4. **Lưu trữ:** Đẩy  lên server và lưu  vào Database qua Prisma.

### 4.2. Luồng Chia sẻ (Share)

1. **Truy xuất:** Chủ sở hữu tải  về máy.
2. **Unwrapping:** Giải mã  bằng Private Key của mình (sau khi nhập Passcode) để lấy .
3. **Re-Wrapping:**
* Lấy  từ Database.
* Thực hiện ECDH (X25519) để tạo shared secret.
* Mã hóa  thành .


4. **Lưu trữ:** Lưu  vào bảng `Shares` trong Database.

---

## 5. Hệ thống Nhật ký kép (Dual-Layer Logging)

Hệ thống đảm bảo mọi hành vi đều có vết tích:

| Hành động | Nhật ký Hệ thống (Internal - Postgres) | Nhật ký Blockchain (On-chain - Sepolia) |
| --- | --- | --- |
| **Tải lên** | Luôn ghi (Metadata & Owner Key). | Không ghi. |
| **Chia sẻ** | Luôn ghi (Ai gửi, ai nhận). | **Tùy chọn:** Ghi log chi tiết (Sender, Recipients, FileID). |
| **Tải về** | Ghi log truy cập thực tế. | **Cập nhật:** Trạng thái "Đã tải" cho từng người nhận cụ thể. |

---

## 6. Yêu cầu Giao diện (UI/UX)

* **Dashboard:** Sử dụng **TanStack Table** để hiển thị danh sách file, tích hợp lọc/tìm kiếm mạnh mẽ.
* **Trạng thái Blockchain:** Hiển thị icon Sepolia kèm link Etherscan nếu file được cấu hình ghi log on-chain.
* **Download Tracking UI:** Hiển thị danh sách người nhận và dấu tích xanh bên cạnh những người đã thực hiện tải file (dữ liệu fetch từ Smart Contract).

---

## 7. Yêu cầu phi chức năng cho Demo

* **Blockchain Fee:** Backend quản lý 1 ví Admin (Metamask/Hardhat account) để chi trả Gas fee.
* **Lưu trữ vật lý:** File mã hóa lưu tại thư mục `/uploads` trên Backend server.
* **Type-safety:** Đảm bảo an toàn kiểu dữ liệu tuyệt đối từ Prisma Schema đến TanStack Start.

