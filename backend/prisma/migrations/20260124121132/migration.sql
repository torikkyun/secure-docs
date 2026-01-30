-- CreateEnum
CREATE TYPE "FileActivityAction" AS ENUM ('UPLOAD', 'SHARE', 'DOWNLOAD', 'DELETE', 'REVOKE_SHARE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passcode" TEXT;

-- CreateTable
CREATE TABLE "file_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "action" "FileActivityAction" NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "file_activities" ADD CONSTRAINT "file_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_activities" ADD CONSTRAINT "file_activities_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
