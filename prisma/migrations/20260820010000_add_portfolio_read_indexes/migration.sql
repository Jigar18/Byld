CREATE INDEX IF NOT EXISTS "User_username_lower_idx" ON "User" (LOWER("username"));
CREATE INDEX IF NOT EXISTS "Skill_userId_idx" ON "Skill"("userId");
CREATE INDEX IF NOT EXISTS "Experience_userId_idx" ON "Experience"("userId");
CREATE INDEX IF NOT EXISTS "Certifications_userId_idx" ON "Certifications"("userId");
CREATE INDEX IF NOT EXISTS "Education_userId_idx" ON "Education"("userId");
