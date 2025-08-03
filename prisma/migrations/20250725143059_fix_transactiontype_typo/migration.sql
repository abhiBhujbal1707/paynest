/*
  Warnings:

  - You are about to drop the column `currency` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_categoryId_fkey";

-- DropIndex
DROP INDEX "budgets_categoryId_idx";

-- DropIndex
DROP INDEX "transactions_categoryId_idx";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "currency";

-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "categoryId",
DROP COLUMN "currency",
DROP COLUMN "endDate",
DROP COLUMN "period",
DROP COLUMN "startDate",
ADD COLUMN     "lastAlertSent" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "categoryId",
DROP COLUMN "currency",
DROP COLUMN "notes",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "lastProcessed" TIMESTAMP(3);

-- DropTable
DROP TABLE "categories";

-- DropEnum
DROP TYPE "BudgetPeriod";

-- CreateIndex
CREATE UNIQUE INDEX "budgets_userId_key" ON "budgets"("userId");
