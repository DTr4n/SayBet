-- CreateTable
CREATE TABLE "public"."status_updates" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "status_updates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."status_updates" ADD CONSTRAINT "status_updates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
