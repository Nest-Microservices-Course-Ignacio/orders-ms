/*
  Warnings:

  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `customerId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `orderStatus` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalItem` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'DELIVERED', 'CANCELLED');

-- DropIndex
DROP INDEX "Orders_orderNumber_key";

-- AlterTable
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_pkey",
DROP COLUMN "customerId",
DROP COLUMN "orderNumber",
ADD COLUMN     "orderStatus" "OrderStatus" NOT NULL,
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "totalItem" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Orders_id_seq";
