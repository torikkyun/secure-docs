-- AlterTable
ALTER TABLE "users" ADD COLUMN     "encrypted_private_key" TEXT,
ADD COLUMN     "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mnemonic" TEXT,
ADD COLUMN     "public_key" TEXT;
