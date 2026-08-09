CREATE TABLE "ProjectImage" (
  "id" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "imagePublicId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "projectId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectImage_imagePublicId_key" ON "ProjectImage"("imagePublicId");
CREATE UNIQUE INDEX "ProjectImage_projectId_position_key" ON "ProjectImage"("projectId", "position");
CREATE INDEX "ProjectImage_projectId_idx" ON "ProjectImage"("projectId");

ALTER TABLE "ProjectImage"
ADD CONSTRAINT "ProjectImage_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
