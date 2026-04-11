-- CreateEnum
CREATE TYPE "FileClassification" AS ENUM ('UNCLASSIFIED', 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "ContentFlag" AS ENUM ('SAFE', 'SENSITIVE', 'FLAGGED');

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "classification" "FileClassification" NOT NULL DEFAULT 'UNCLASSIFIED',
ADD COLUMN     "content_flag" "ContentFlag" NOT NULL DEFAULT 'SAFE';
