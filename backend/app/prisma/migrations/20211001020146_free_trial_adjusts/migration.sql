/*
  Warnings:

  - You are about to drop the column `paymentProviderCheckoutId` on the `Subscription` table. All the data in the column will be lost.
  - Made the column `paymentProviderId` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'TRIAL_EXPIRED';

-- DropIndex
DROP INDEX "Subscription.paymentProviderCheckoutId_unique";

-- DropIndex
DROP INDEX "Subscription.paymentProviderId_unique";

-- AlterTable
ALTER TABLE "CustomerPaymentSettings" ADD COLUMN     "paymentProviderPaymentMethodId" TEXT;

-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "allowFreeTrial" BOOLEAN NOT NULL DEFAULT false;


-- DeleteTable
DELETE FROM "Subscription" WHERE "paymentProviderId" IS NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "paymentProviderCheckoutId",
ADD COLUMN     "trialEndedAt" TIMESTAMP(3),
ADD COLUMN     "trialStartedAt" TIMESTAMP(3),
ALTER COLUMN "paymentProviderId" SET NOT NULL;
