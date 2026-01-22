/*
  Warnings:

  - You are about to drop the column `revoke_signature` on the `access_grants` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `access_grants` table. All the data in the column will be lost.
  - You are about to drop the column `tx_hash` on the `access_grants` table. All the data in the column will be lost.
  - You are about to drop the column `blockchain_tx_hash` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `cid` on the `files` table. All the data in the column will be lost.
  - You are about to alter the column `file_hash` on the `files` table. The data in that column could be lost. The data in that column will be cast from `VarChar(66)` to `VarChar(64)`.
  - You are about to drop the column `signature` on the `user_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_address` on the `user_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `public_key` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `ipfs_pin_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ipfs_pins` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `file_path` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_file_name` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passcode` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ipfs_pins" DROP CONSTRAINT "ipfs_pins_file_id_fkey";

-- DropForeignKey
ALTER TABLE "ipfs_pins" DROP CONSTRAINT "ipfs_pins_pin_status_id_fkey";

-- DropIndex
DROP INDEX "users_wallet_address_key";

-- AlterTable
ALTER TABLE "access_grants" DROP COLUMN "revoke_signature",
DROP COLUMN "signature",
DROP COLUMN "tx_hash";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "blockchain_tx_hash",
DROP COLUMN "signature",
DROP COLUMN "timestamp",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tx_hash" VARCHAR(66);

-- AlterTable
ALTER TABLE "files" DROP COLUMN "cid",
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "mime_type" VARCHAR(100) NOT NULL,
ADD COLUMN     "original_file_name" VARCHAR(255) NOT NULL,
ALTER COLUMN "file_hash" SET DATA TYPE VARCHAR(64);

-- AlterTable
ALTER TABLE "user_sessions" DROP COLUMN "signature",
DROP COLUMN "wallet_address";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "public_key",
DROP COLUMN "wallet_address",
ADD COLUMN     "passcode" VARCHAR(6) NOT NULL,
ALTER COLUMN "password" SET NOT NULL;

-- DropTable
DROP TABLE "ipfs_pin_status";

-- DropTable
DROP TABLE "ipfs_pins";
