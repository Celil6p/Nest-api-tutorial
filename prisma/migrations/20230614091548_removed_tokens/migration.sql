/*
  Warnings:

  - You are about to drop the column `googleAccessToken` on the `bookmarks` table. All the data in the column will be lost.
  - You are about to drop the column `googleRefreshToken` on the `bookmarks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookmarks" DROP COLUMN "googleAccessToken",
DROP COLUMN "googleRefreshToken";
