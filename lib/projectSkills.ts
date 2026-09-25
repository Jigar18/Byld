import type { Prisma } from "@prisma/client";

const mergeSkills = (currentSkills: string[], projectSkills: string[]) => {
  const merged = [...currentSkills];
  for (const skill of projectSkills) {
    if (merged.some((current) => current.toLowerCase() === skill.toLowerCase())) continue;
    merged.push(skill.charAt(0).toUpperCase() + skill.slice(1));
  }
  return merged;
};

// Adds a project's skills to the owner's Skills section and returns the full list.
export async function addProjectSkillsToPortfolio(
  tx: Prisma.TransactionClient,
  userId: string,
  projectSkills: string[],
) {
  const existing = await tx.skill.findFirst({ where: { userId } });
  const skills = mergeSkills(existing?.skills ?? [], projectSkills);

  if (existing && skills.length !== existing.skills.length) {
    await tx.skill.update({ where: { id: existing.id }, data: { skills } });
  } else if (!existing && skills.length) {
    await tx.skill.create({ data: { userId, skills } });
  }

  return skills;
}
