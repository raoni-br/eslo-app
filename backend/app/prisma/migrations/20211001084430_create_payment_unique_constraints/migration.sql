/*
  Warnings:

  - A unique constraint covering the columns `[paymentProviderId]` on the table `CustomerPaymentSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentProviderId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Made the column `recurringEventId` on table `EventOccurrence` required. This step will fail if there are existing NULL values in that column.
  - Made the column `moduleId` on table `Level` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ClassRecord" DROP CONSTRAINT "ClassRecord_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "ClassRecord" DROP CONSTRAINT "ClassRecord_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerPaymentSettings" DROP CONSTRAINT "CustomerPaymentSettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_levelId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_organiserId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendee" DROP CONSTRAINT "EventAttendee_attendeeId_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendee" DROP CONSTRAINT "EventAttendee_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventOccurrence" DROP CONSTRAINT "EventOccurrence_organiserId_fkey";

-- DropForeignKey
ALTER TABLE "EventOccurrence" DROP CONSTRAINT "EventOccurrence_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "EventOccurrence" DROP CONSTRAINT "EventOccurrence_recurringEventId_fkey";

-- DropForeignKey
ALTER TABLE "EventOccurrenceAttendee" DROP CONSTRAINT "EventOccurrenceAttendee_attendeeId_fkey";

-- DropForeignKey
ALTER TABLE "EventOccurrenceAttendee" DROP CONSTRAINT "EventOccurrenceAttendee_eventOccurrenceId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_inviteeId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_priceId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_levelId_fkey";

-- DropForeignKey
ALTER TABLE "Level" DROP CONSTRAINT "Level_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_programId_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_productId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_subcategoryCode_fkey";

-- DropForeignKey
ALTER TABLE "ProductSubcategory" DROP CONSTRAINT "ProductSubcategory_categoryCode_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroup" DROP CONSTRAINT "StudyGroup_levelId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupClassAttendee" DROP CONSTRAINT "StudyGroupClassAttendee_classRecordId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupClassAttendee" DROP CONSTRAINT "StudyGroupClassAttendee_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupClassAttendee" DROP CONSTRAINT "StudyGroupClassAttendee_studyGroupClassRecordId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupClassRecord" DROP CONSTRAINT "StudyGroupClassRecord_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupClassRecord" DROP CONSTRAINT "StudyGroupClassRecord_studyGroupId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupClassRecord" DROP CONSTRAINT "StudyGroupClassRecord_studyGroupTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupTeacher" DROP CONSTRAINT "StudyGroupTeacher_studyGroupId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupTeacher" DROP CONSTRAINT "StudyGroupTeacher_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_customerId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionItem" DROP CONSTRAINT "SubscriptionItem_priceId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionItem" DROP CONSTRAINT "SubscriptionItem_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAuthentication" DROP CONSTRAINT "UserAuthentication_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserIdentification" DROP CONSTRAINT "UserIdentification_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPhoneNumber" DROP CONSTRAINT "UserPhoneNumber_userId_fkey";

-- DropIndex
DROP INDEX "Subscription.paymentProviderId_index";

-- AlterTable
ALTER TABLE "ClassRecord" RENAME CONSTRAINT "LessonTracker_pkey" TO "ClassRecord_pkey";

-- AlterTable
ALTER TABLE "EventOccurrence" ALTER COLUMN "recurringEventId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Level" ALTER COLUMN "moduleId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPaymentSettings_paymentProviderId_key" ON "CustomerPaymentSettings"("paymentProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paymentProviderId_key" ON "Subscription"("paymentProviderId");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organiserId_fkey" FOREIGN KEY ("organiserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD CONSTRAINT "EventOccurrence_organiserId_fkey" FOREIGN KEY ("organiserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD CONSTRAINT "EventOccurrence_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD CONSTRAINT "EventOccurrence_recurringEventId_fkey" FOREIGN KEY ("recurringEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrenceAttendee" ADD CONSTRAINT "EventOccurrenceAttendee_eventOccurrenceId_fkey" FOREIGN KEY ("eventOccurrenceId") REFERENCES "EventOccurrence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrenceAttendee" ADD CONSTRAINT "EventOccurrenceAttendee_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRecord" ADD CONSTRAINT "ClassRecord_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRecord" ADD CONSTRAINT "ClassRecord_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoneNumber" ADD CONSTRAINT "UserPhoneNumber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIdentification" ADD CONSTRAINT "UserIdentification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuthentication" ADD CONSTRAINT "UserAuthentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroup" ADD CONSTRAINT "StudyGroup_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupTeacher" ADD CONSTRAINT "StudyGroupTeacher_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupTeacher" ADD CONSTRAINT "StudyGroupTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassRecord" ADD CONSTRAINT "StudyGroupClassRecord_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassRecord" ADD CONSTRAINT "StudyGroupClassRecord_studyGroupTeacherId_fkey" FOREIGN KEY ("studyGroupTeacherId") REFERENCES "StudyGroupTeacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassRecord" ADD CONSTRAINT "StudyGroupClassRecord_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassAttendee" ADD CONSTRAINT "StudyGroupClassAttendee_studyGroupClassRecordId_fkey" FOREIGN KEY ("studyGroupClassRecordId") REFERENCES "StudyGroupClassRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassAttendee" ADD CONSTRAINT "StudyGroupClassAttendee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassAttendee" ADD CONSTRAINT "StudyGroupClassAttendee_classRecordId_fkey" FOREIGN KEY ("classRecordId") REFERENCES "ClassRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subcategoryCode_fkey" FOREIGN KEY ("subcategoryCode") REFERENCES "ProductSubcategory"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSubcategory" ADD CONSTRAINT "ProductSubcategory_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "ProductCategory"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPaymentSettings" ADD CONSTRAINT "CustomerPaymentSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Invitation.invitationToken_unique" RENAME TO "Invitation_invitationToken_key";

-- RenameIndex
ALTER INDEX "Invoice.paymentProviderId_unique" RENAME TO "Invoice_paymentProviderId_key";

-- RenameIndex
ALTER INDEX "InvoiceItem.invoiceId_priceId_unique" RENAME TO "InvoiceItem_invoiceId_priceId_key";

-- RenameIndex
ALTER INDEX "InvoiceItem.paymentProviderId_unique" RENAME TO "InvoiceItem_paymentProviderId_key";

-- RenameIndex
ALTER INDEX "Lesson.code_unique" RENAME TO "Lesson_code_key";

-- RenameIndex
ALTER INDEX "Level.code_unique" RENAME TO "Level_code_key";

-- RenameIndex
ALTER INDEX "Module.code_unique" RENAME TO "Module_code_key";

-- RenameIndex
ALTER INDEX "Price.paymentProviderId_unique" RENAME TO "Price_paymentProviderId_key";

-- RenameIndex
ALTER INDEX "Price.slug_unique" RENAME TO "Price_slug_key";

-- RenameIndex
ALTER INDEX "Product.paymentProviderId_unique" RENAME TO "Product_paymentProviderId_key";

-- RenameIndex
ALTER INDEX "Product.slug_unique" RENAME TO "Product_slug_key";

-- RenameIndex
ALTER INDEX "Program.code_unique" RENAME TO "Program_code_key";

-- RenameIndex
ALTER INDEX "SubscriptionItem.paymentProviderId_unique" RENAME TO "SubscriptionItem_paymentProviderId_key";

-- RenameIndex
ALTER INDEX "User.primaryEmail_unique" RENAME TO "User_primaryEmail_key";

-- RenameIndex
ALTER INDEX "UserAuthentication.userId_strategyCode_unique" RENAME TO "UserAuthentication_userId_strategyCode_key";
