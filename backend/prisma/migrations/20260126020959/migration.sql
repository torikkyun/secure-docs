/*
  Warnings:

  - You are about to drop the column `encrypted_private_key` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_locked` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mnemonic` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `public_key` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "encrypted_private_key",
DROP COLUMN "is_locked",
DROP COLUMN "mnemonic",
DROP COLUMN "public_key";
