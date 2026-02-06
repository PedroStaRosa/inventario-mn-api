/*
  Warnings:

  - Made the column `stockExpected` on table `InventoryItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stockCounted` on table `InventoryItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `difference` on table `InventoryItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "unitInput" SET DEFAULT 'UN',
ALTER COLUMN "stockExpected" SET NOT NULL,
ALTER COLUMN "stockCounted" SET NOT NULL,
ALTER COLUMN "difference" SET NOT NULL;
