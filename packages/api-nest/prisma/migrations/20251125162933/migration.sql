/*
  Warnings:

  - The primary key for the `access_grant_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `blockchain_sync_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `download_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `file_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ipfs_pin_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `receipt_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `access_grant_status` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `blockchain_sync_status` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `download_status` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `file_status` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ipfs_pin_status` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `receipt_status` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `access_grant_status` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `access_grant_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status_id` on the `access_grants` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `ip_address` on table `audit_logs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_agent` on table `audit_logs` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `status_id` on the `blockchain_sync` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `blockchain_sync_status` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `blockchain_sync_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `download_status` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `download_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `access_grant_id` on table `downloads` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ip_address` on table `downloads` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_agent` on table `downloads` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `status_id` on the `downloads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `file_status` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `file_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `file_type` on table `files` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `status_id` on the `files` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `ipfs_pin_status` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `ipfs_pin_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pin_status_id` on the `ipfs_pins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `receipt_status` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `receipt_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status_id` on the `receipts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `last_login_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "access_grants" DROP CONSTRAINT "access_grants_status_id_fkey";

-- DropForeignKey
ALTER TABLE "blockchain_sync" DROP CONSTRAINT "blockchain_sync_status_id_fkey";

-- DropForeignKey
ALTER TABLE "downloads" DROP CONSTRAINT "downloads_access_grant_id_fkey";

-- DropForeignKey
ALTER TABLE "downloads" DROP CONSTRAINT "downloads_status_id_fkey";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_status_id_fkey";

-- DropForeignKey
ALTER TABLE "ipfs_pins" DROP CONSTRAINT "ipfs_pins_pin_status_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_related_file_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_related_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_status_id_fkey";

-- AlterTable
ALTER TABLE "access_grant_status" DROP CONSTRAINT "access_grant_status_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "access_grant_status_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "access_grants" DROP COLUMN "status_id",
ADD COLUMN     "status_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "ip_address" SET NOT NULL,
ALTER COLUMN "user_agent" SET NOT NULL;

-- AlterTable
ALTER TABLE "blockchain_sync" DROP COLUMN "status_id",
ADD COLUMN     "status_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "blockchain_sync_status" DROP CONSTRAINT "blockchain_sync_status_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "blockchain_sync_status_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "download_status" DROP CONSTRAINT "download_status_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "download_status_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "downloads" ALTER COLUMN "access_grant_id" SET NOT NULL,
ALTER COLUMN "ip_address" SET NOT NULL,
ALTER COLUMN "user_agent" SET NOT NULL,
DROP COLUMN "status_id",
ADD COLUMN     "status_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "file_status" DROP CONSTRAINT "file_status_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "file_status_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "files" ALTER COLUMN "file_type" SET NOT NULL,
DROP COLUMN "status_id",
ADD COLUMN     "status_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ipfs_pin_status" DROP CONSTRAINT "ipfs_pin_status_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ipfs_pin_status_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ipfs_pins" DROP COLUMN "pin_status_id",
ADD COLUMN     "pin_status_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "receipt_status" DROP CONSTRAINT "receipt_status_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "receipt_status_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "receipts" DROP COLUMN "status_id",
ADD COLUMN     "status_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "last_login_at" SET NOT NULL;

-- DropTable
DROP TABLE "notifications";

-- CreateIndex
CREATE UNIQUE INDEX "access_grant_status_name_key" ON "access_grant_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_sync_status_name_key" ON "blockchain_sync_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "download_status_name_key" ON "download_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "file_status_name_key" ON "file_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ipfs_pin_status_name_key" ON "ipfs_pin_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_status_name_key" ON "receipt_status"("name");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "file_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "access_grant_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_access_grant_id_fkey" FOREIGN KEY ("access_grant_id") REFERENCES "access_grants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "download_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "receipt_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_sync" ADD CONSTRAINT "blockchain_sync_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "blockchain_sync_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ipfs_pins" ADD CONSTRAINT "ipfs_pins_pin_status_id_fkey" FOREIGN KEY ("pin_status_id") REFERENCES "ipfs_pin_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
