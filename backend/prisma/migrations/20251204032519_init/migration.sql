-- CreateTable
CREATE TABLE "ResearchTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'anonymous',
    "query" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "report" TEXT,
    "summary" TEXT,
    "metadata" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ResearchTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "snippet" TEXT,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchCache" (
    "id" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchTask_userId_idx" ON "ResearchTask"("userId");

-- CreateIndex
CREATE INDEX "ResearchTask_status_idx" ON "ResearchTask"("status");

-- CreateIndex
CREATE INDEX "ResearchTask_createdAt_idx" ON "ResearchTask"("createdAt");

-- CreateIndex
CREATE INDEX "Source_taskId_idx" ON "Source"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchCache_queryHash_key" ON "ResearchCache"("queryHash");

-- CreateIndex
CREATE INDEX "ResearchCache_expiresAt_idx" ON "ResearchCache"("expiresAt");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ResearchTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
