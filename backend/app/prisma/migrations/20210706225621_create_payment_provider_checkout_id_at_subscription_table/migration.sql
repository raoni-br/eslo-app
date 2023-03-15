/*
  Warnings:

  - A unique constraint covering the columns `[paymentProviderId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentProviderCheckoutId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "paymentProviderCheckoutId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription.paymentProviderId_unique" ON "Subscription"("paymentProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription.paymentProviderCheckoutId_unique" ON "Subscription"("paymentProviderCheckoutId");
