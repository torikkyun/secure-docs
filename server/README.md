# Nest Prisma Postgres Boilerplate

Thực hiện theo: [Best Folder Structure for NestJS Projects (2025 Guide) - Nairi Abgaryan](https://medium.com/@nairi.abgaryan/stop-the-chaos-clean-folder-file-naming-guide-for-backend-nest-js-and-node-331fdc6400cb)

## Cấu trúc thư mục

```plaintext
src/
├── core/           # Hạ tầng nội bộ dùng chung (auth, logger, redis, mail...)
├── common/         # Tiện ích dùng chung (pipes, decorators, types...)
├── integrations/   # Wrapper cho dịch vụ bên ngoài (Stripe, AWS, PayTech...)
├── modules/        # Các module nghiệp vụ chính (user, transaction, account...)
├── events/         # Logic sự kiện (publish/subscribe)
├── commands/       # Các job CLI hoặc CRON
├── app.module.ts   # Module gốc của ứng dụng
└── main.ts         # Điểm khởi chạy ứng dụng
```

## Quy tắc đặt tên

| Loại file        | Quy tắc đặt tên                     | Ví dụ                          |
|------------------|-------------------------------------|--------------------------------|
| Module           | `[name].module.ts`                  | `user.module.ts`              |
| Service          | `[name].service.ts`                 | `auth.service.ts`             |
| DTO              | `[action]-[entity].dto.ts`          | `create-user.dto.ts`          |
| Client           | `[provider]-[entity].client.ts`     | `stripe-payment.client.ts`    |
| Guard / Pipe     | `[name].guard.ts` / `[name].pipe.ts`| `jwt.guard.ts`, `trim.pipe.ts`|

## Nguyên tắc phân loại file

- **Tính năng nghiệp vụ** -> `modules/[feature]/`
- **DTO** -> `modules/[feature]/dto/`
- **Tiện ích hoặc decorator**
  - Dùng riêng cho module -> `modules/[feature]/utils/`
  - Dùng toàn cục -> `common/utils/`
- **Cấu hình hạ tầng (auth, redis...)** -> `core/`
- **Wrapper dịch vụ bên ngoài** -> `integrations/`
- **Job CLI hoặc CRON** -> `commands/`
- **Sự kiện (Event)** -> `events/`
- **Kiểm thử (Test)** -> `test/`

## Testing

| Loại test   | Vị trí đặt file                        | Ví dụ                         |
|-------------|----------------------------------------|-------------------------------|
| Unit Test   | Cùng thư mục với file chính            | `user.service.spec.ts`        |
| E2E Test    | Trong thư mục `test/` hoặc `e2e/`      | `user.e2e-spec.ts`            |

## Hướng dẫn cài đặt

```bash
pnpm install

# Khởi động database với docker
docker compose -f compose.db.yml up -d --build
```

## Hướng dẫn tạo file môi trường

```bash
# development
cp .env.dev .env.development.local

# production
cp .env.prod .env.production.local
```

## Chạy dự án

```bash
# development
pnpm start:dev

# test
pnpm test

# e2e test
pnpm test:e2e

# production với docker
docker compose -f compose.yml --env-file .env.production.local up -d --build
```
