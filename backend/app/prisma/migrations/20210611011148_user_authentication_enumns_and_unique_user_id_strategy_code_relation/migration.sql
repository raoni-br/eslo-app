/*
  Warnings:

  - A unique constraint covering the columns `[userId,strategyCode]` on the table `UserAuthentication` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `strategyCode` on the `UserAuthentication` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Update
UPDATE "UserAuthentication" SET "strategyCode" = UPPER("strategyCode") WHERE 1 = 1;

-- Delete duplicated
WITH "userStrategy" AS (
	SELECT
		"id",
		"userId",
		"strategyCode",
		ROW_NUMBER() OVER (PARTITION BY "userId", "strategyCode") AS "strategyOrder",
		COUNT(*) OVER (PARTITION BY "userId", "strategyCode") AS "strategyTotal"
	FROM "UserAuthentication"
)
DELETE FROM "UserAuthentication"
WHERE "id" IN (SELECT "id" FROM "userStrategy" WHERE "strategyTotal" > 1 AND "strategyOrder" != 1);

-- Delete invalid
DELETE FROM public."UserAuthentication" WHERE "strategyCode" NOT IN ('LOCAL', 'FACEBOOK', 'LINKEDIN', 'GOOGLE', 'REX');

-- CreateEnum
CREATE TYPE "UserAuthStrategy" AS ENUM ('LOCAL', 'FACEBOOK', 'GOOGLE', 'LINKEDIN', 'REX');

-- AlterTable
ALTER TABLE "UserAuthentication"
ALTER COLUMN "strategyCode" DROP NOT NULL,
ALTER COLUMN "strategyCode" TYPE "UserAuthStrategy" using "strategyCode"::"UserAuthStrategy",
ALTER COLUMN "strategyCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthentication.userId_strategyCode_unique" ON "UserAuthentication"("userId", "strategyCode");
