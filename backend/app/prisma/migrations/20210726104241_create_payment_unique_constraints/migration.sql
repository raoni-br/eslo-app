/*
  Warnings:

  - A unique constraint covering the columns `[paymentProviderId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentProviderId]` on the table `InvoiceItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceId,priceId]` on the table `InvoiceItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentProviderId]` on the table `Price` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentProviderId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentProviderId]` on the table `SubscriptionItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paymentProviderId" TEXT;

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "paymentProviderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice.paymentProviderId_unique" ON "Invoice"("paymentProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem.paymentProviderId_unique" ON "InvoiceItem"("paymentProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem.invoiceId_priceId_unique" ON "InvoiceItem"("invoiceId", "priceId");

-- CreateIndex
CREATE UNIQUE INDEX "Price.paymentProviderId_unique" ON "Price"("paymentProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "Product.paymentProviderId_unique" ON "Product"("paymentProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionItem.paymentProviderId_unique" ON "SubscriptionItem"("paymentProviderId");
