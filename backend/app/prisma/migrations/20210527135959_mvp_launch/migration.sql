-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('ENROLLMENT', 'STUDY_GROUP', 'ENROLLMENT_TRANSFER');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LessonRecordStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SESSION_DONE', 'LESSON_DONE');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'DECLINED', 'CANCELLED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('CONFIRMED', 'TENTATIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventAttendeeStatus" AS ENUM ('PENDING', 'DECLINED', 'MAYBE', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('BUSY', 'FREE');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "UserAuthenticationStatus" AS ENUM ('UNCONFIRMED', 'INACTIVE', 'ACTIVE');

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" UUID NOT NULL,
    "levelId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "studyGroupId" UUID,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "activationDate" TIMESTAMP(3),
    "status" "EnrollmentStatus" NOT NULL DEFAULT E'PENDING',
    "externalKey" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "availabilityType" "AvailabilityType" NOT NULL DEFAULT E'BUSY',
    "sourceType" "SourceType" NOT NULL,
    "enrollmentId" UUID,
    "studyGroupId" UUID,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "startTimeZone" TEXT NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "endTimeZone" TEXT NOT NULL,
    "recurrence" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT E'CONFIRMED',
    "sendNotifications" BOOLEAN NOT NULL DEFAULT true,
    "iCalUID" TEXT,
    "organiserId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "visibility" "EventVisibility" NOT NULL DEFAULT E'PUBLIC',
    "conferenceData" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAttendee" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "attendeeId" UUID NOT NULL,
    "responseStatus" "EventAttendeeStatus" NOT NULL DEFAULT E'PENDING',
    "responseDateTime" TIMESTAMP(3),
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "organiser" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventOccurrence" (
    "id" UUID NOT NULL,
    "recurringEventId" UUID,
    "originalStartDateTime" TIMESTAMP(3),
    "originalStartTimeZone" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "availabilityType" "AvailabilityType" NOT NULL DEFAULT E'BUSY',
    "sourceType" "SourceType" NOT NULL,
    "enrollmentId" UUID,
    "studyGroupId" UUID,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "startTimeZone" TEXT NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "endTimeZone" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT E'CONFIRMED',
    "sendNotifications" BOOLEAN NOT NULL DEFAULT true,
    "iCalUID" TEXT,
    "organiserId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT E'PUBLIC',
    "conferenceData" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventOccurrenceAttendee" (
    "id" UUID NOT NULL,
    "eventOccurrenceId" UUID NOT NULL,
    "attendeeId" UUID NOT NULL,
    "responseStatus" "EventAttendeeStatus" NOT NULL DEFAULT E'PENDING',
    "responseDateTime" TIMESTAMP(3),
    "optional" BOOLEAN NOT NULL,
    "comment" TEXT NOT NULL,
    "organiser" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "enrollmentId" UUID,
    "studyGroupId" UUID,
    "invitationToken" TEXT NOT NULL,
    "tokenIssuedDateTime" TIMESTAMP(3),
    "tokenActionedDateTime" TIMESTAMP(3),
    "inviterId" UUID NOT NULL,
    "inviteeId" UUID NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT E'PENDING',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "providerInfo" JSONB,
    "category" TEXT NOT NULL,
    "levelOrder" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "slug" TEXT,
    "lessonMaterial" JSONB NOT NULL,
    "levelId" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonTracker" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "teacherNotes" TEXT,
    "status" "LessonRecordStatus" NOT NULL DEFAULT E'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lessonStartedAt" TIMESTAMP(3),
    "lessonEndedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerInfo" JSONB,
    "moduleOrder" INTEGER NOT NULL,
    "description" TEXT,
    "label" VARCHAR(12) NOT NULL,
    "moduleId" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerInfo" JSONB,
    "programOrder" INTEGER NOT NULL,
    "description" TEXT,
    "releasedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "programId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "label" VARCHAR(12) NOT NULL,
    "description" TEXT NOT NULL,
    "providerInfo" JSONB,
    "releasedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profilePicUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPhoneNumber" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "countryISO" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rawFormat" TEXT,
    "nationalFormat" TEXT,
    "internationalFormat" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIdentification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "countryISO" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "attachementUrl" TEXT,
    "providerInfo" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAddress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "addressType" TEXT NOT NULL,
    "postalCode" TEXT,
    "street" TEXT,
    "streetNumber" TEXT,
    "streetComplement" TEXT,
    "district" TEXT,
    "city" TEXT,
    "state" TEXT,
    "countryISO" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "providerInfo" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuthentication" (
    "id" UUID NOT NULL,
    "strategyCode" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "status" "UserAuthenticationStatus" NOT NULL DEFAULT E'UNCONFIRMED',
    "registrationToken" TEXT,
    "registrationTokenTimestamp" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordTokenTimestamp" TIMESTAMP(3),
    "passwordChangedTimestamp" TIMESTAMP(3),
    "hashedPassword" TEXT,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "userProfile" JSONB,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "levelId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroupTeacher" (
    "id" UUID NOT NULL,
    "studyGroupId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroupClassRecord" (
    "id" UUID NOT NULL,
    "studyGroupId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "studyGroupTeacherId" UUID NOT NULL,
    "teacherNotes" TEXT,
    "status" "LessonRecordStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lessonStartedAt" TIMESTAMP(3),
    "lessonEndedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroupClassAttendee" (
    "id" UUID NOT NULL,
    "studyGroupClassRecordId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "lessonTrackerId" UUID NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation.invitationToken_unique" ON "Invitation"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson.code_unique" ON "Lesson"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Level.code_unique" ON "Level"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Module.code_unique" ON "Module"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Program.code_unique" ON "Program"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User.primaryEmail_unique" ON "User"("primaryEmail");

-- CreateIndex
CREATE UNIQUE INDEX "StudyGroupClassAttendee_lessonTrackerId_unique" ON "StudyGroupClassAttendee"("lessonTrackerId");

-- AddForeignKey
ALTER TABLE "StudyGroupClassRecord" ADD FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassRecord" ADD FOREIGN KEY ("studyGroupTeacherId") REFERENCES "StudyGroupTeacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassRecord" ADD FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassAttendee" ADD FOREIGN KEY ("studyGroupClassRecordId") REFERENCES "StudyGroupClassRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassAttendee" ADD FOREIGN KEY ("studentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupClassAttendee" ADD FOREIGN KEY ("lessonTrackerId") REFERENCES "LessonTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrenceAttendee" ADD FOREIGN KEY ("eventOccurrenceId") REFERENCES "EventOccurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrenceAttendee" ADD FOREIGN KEY ("attendeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIdentification" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuthentication" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD FOREIGN KEY ("attendeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroup" ADD FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTracker" ADD FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTracker" ADD FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupTeacher" ADD FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupTeacher" ADD FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD FOREIGN KEY ("organiserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD FOREIGN KEY ("recurringEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("organiserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoneNumber" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
