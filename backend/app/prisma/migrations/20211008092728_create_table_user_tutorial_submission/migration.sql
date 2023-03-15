-- CreateTable
CREATE TABLE "UserTutorialSubmission" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tutorialCode" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "formSubmission" JSONB NOT NULL,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserTutorialSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTutorialSubmission" ADD CONSTRAINT "UserTutorialSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
