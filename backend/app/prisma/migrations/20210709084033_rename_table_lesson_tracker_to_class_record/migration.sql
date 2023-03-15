-- DropForeignKey
ALTER TABLE "LessonTracker" DROP CONSTRAINT "LessonTracker_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "LessonTracker" DROP CONSTRAINT "LessonTracker_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupClassAttendee" DROP CONSTRAINT "StudyGroupClassAttendee_lessonTrackerId_fkey";

-- DropIndex
DROP INDEX "StudyGroupClassAttendee_lessonTrackerId_unique";


-- RenameTable
ALTER TABLE "LessonTracker" RENAME TO "ClassRecord";

ALTER TABLE "StudyGroupClassAttendee" RENAME COLUMN "lessonTrackerId" TO "classRecordId";


-- CreateIndex
CREATE UNIQUE INDEX "StudyGroupClassAttendee_classRecordId_unique" ON "StudyGroupClassAttendee"("classRecordId");

-- AddForeignKey
ALTER TABLE "ClassRecord" ADD FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRecord" ADD FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassAttendee" ADD FOREIGN KEY ("classRecordId") REFERENCES "ClassRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
