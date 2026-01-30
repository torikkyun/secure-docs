/*
  Warnings:

  - You are about to drop the `user_keys` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[public_key]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `public_key` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_keys" DROP CONSTRAINT "user_keys_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "public_key" TEXT NOT NULL;

-- DropTable
DROP TABLE "user_keys";

-- CreateIndex
CREATE UNIQUE INDEX "users_public_key_key" ON "users"("public_key");
