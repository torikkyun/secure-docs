# Ứng dụng Quản lý Tài liệu An toàn

Đây là một dự án ứng dụng cho máy tính (desktop app) được xây dựng bằng Electron và Next.js.

## Công nghệ sử dụng

- **[Electron](https://www.electronjs.org/)**: Nền tảng để xây dựng ứng dụng desktop với công nghệ web.
- **[Next.js](https://nextjs.org/)**: Framework React để xây dựng giao diện người dùng.
- **[React](https://react.dev/)**: Thư viện JavaScript để xây dựng giao diện.
- **[TypeScript](https://www.typescriptlang.org/)**: Ngôn ngữ lập trình giúp tăng cường chất lượng mã nguồn.

## Hướng dẫn Cài đặt và Khởi chạy

### Yêu cầu

- [Node.js](https://nodejs.org/) (phiên bản 20.x trở lên)
- Trình quản lý package: [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), hoặc [pnpm](https://pnpm.io/)

### Các bước thực hiện

1.  **Cài đặt các gói phụ thuộc:**
    Mở terminal và chạy lệnh sau:
    ```bash
    npm install
    ```

2.  **Khởi chạy ứng dụng ở chế độ phát triển (development):**
    Sau khi cài đặt xong, chạy lệnh:
    ```bash
    npm run dev
    ```
    Lệnh này sẽ khởi động server Next.js và mở cửa sổ ứng dụng Electron. Mọi thay đổi trong mã nguồn sẽ được tự động cập nhật.

## Cấu trúc Thư mục

-   `/app`: Chứa toàn bộ mã nguồn cho giao diện người dùng được viết bằng Next.js.
-   `/main`: Chứa mã nguồn cho tiến trình chính (main process) của Electron, dùng để quản lý cửa sổ và các tác vụ hệ thống.
-   `/public`: Chứa các file tĩnh như hình ảnh, icon.

## Các câu lệnh (Scripts)

-   `npm run dev`: Khởi chạy ứng dụng ở chế độ phát triển.
-   `npm run build`: Biên dịch ứng dụng Next.js và đóng gói thành file thực thi (executable) cho các hệ điều hành.
-   `npm run lint`: Chạy trình kiểm tra lỗi và phong cách mã nguồn (linter).