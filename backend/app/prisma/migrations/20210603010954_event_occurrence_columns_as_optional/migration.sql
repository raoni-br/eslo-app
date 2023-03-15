-- AlterTable
ALTER TABLE "EventOccurrenceAttendee"
ALTER COLUMN "optional" SET DEFAULT false,
ALTER COLUMN "comment" DROP NOT NULL,
ALTER COLUMN "organiser" SET DEFAULT false;
