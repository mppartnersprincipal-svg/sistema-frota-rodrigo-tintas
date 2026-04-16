-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSteps" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "TripStop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "TripStop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TripStop" ADD CONSTRAINT "TripStop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
