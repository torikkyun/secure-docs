/*
  Warnings:

  - Added the required column `updated_at` to the `access_grant_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `blockchain_sync_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `download_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `file_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ipfs_pin_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `receipt_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "access_grant_status" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "blockchain_sync_status" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "download_status" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "file_status" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ipfs_pin_status" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "receipt_status" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "description" TEXT;
