-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'MAD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'USD';
