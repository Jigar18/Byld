import "server-only";

import { db } from "@/lib/db";
import type { PortfolioInitialData } from "@/types/portfolio";

const socialFields = {
  email: true,
  twitter: true,
  linkedin: true,
  instagram: true,
  github: true,
  medium: true,
  blog: true,
  leetcode: true,
  youtube: true,
  portfolio: true,
  hackerrank: true,
} as const;

export async function loadPortfolioData(username: string) {
  const user = await db.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: {
      id: true,
      username: true,
      details: true,
      skills: { take: 1, select: { skills: true, iconMap: true } },
      projects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          techStack: true,
          githubUrl: true,
          liveUrl: true,
          videoUrl: true,
          videoPublicId: true,
          videoDuration: true,
          videoBytes: true,
          videoFormat: true,
          images: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              imageUrl: true,
              imagePublicId: true,
              position: true,
            },
          },
        },
      },
      experiences: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          company: true,
          position: true,
          startMonth: true,
          startYear: true,
          endMonth: true,
          endYear: true,
          isCurrentRole: true,
          contributions: true,
        },
      },
      socialLinks: { take: 1, select: socialFields },
      certifications: {
        orderBy: { id: "desc" },
        select: { id: true, title: true, description: true, pdfUrl: true },
      },
      education: {
        select: {
          id: true,
          school: true,
          degree: true,
          field: true,
          startYear: true,
          endYear: true,
          isCurrently: true,
          description: true,
        },
      },
    },
  });

  if (!user?.details) return null;

  const education = user.education.length
    ? [...user.education].sort((a, b) => {
        if (a.isCurrently !== b.isCurrently) return a.isCurrently ? -1 : 1;
        return (b.endYear ?? b.startYear) - (a.endYear ?? a.startYear) || b.startYear - a.startYear;
      })
    : user.details.college
      ? [{
          school: user.details.college,
          degree: "Bachelor of Technology",
          field: "Computer Science",
          startYear: user.details.startYear,
          endYear: user.details.endYear,
          isCurrently: user.details.endYear > new Date().getFullYear(),
          description: null,
        }]
      : [];
  const skillRecord = user.skills[0];
  const iconMap =
    skillRecord?.iconMap && typeof skillRecord.iconMap === "object" && !Array.isArray(skillRecord.iconMap)
      ? Object.fromEntries(
          Object.entries(skillRecord.iconMap).filter(
            (entry): entry is [string, string | null] => entry[1] === null || typeof entry[1] === "string",
          ),
        )
      : {};

  return {
    id: user.id,
    username: user.username,
    details: {
      firstName: user.details.firstName,
      lastName: user.details.lastName,
      email: user.details.email,
      location: user.details.location,
      jobTitle: user.details.jobTitle,
      college: user.details.college,
      imageUrl: user.details.imageUrl ?? "",
      about: user.details.about ?? "",
    },
    skills: skillRecord?.skills ?? [],
    iconMap,
    projects: user.projects,
    experiences: user.experiences.map((experience) => ({
      ...experience,
      endMonth: experience.endMonth ?? undefined,
      endYear: experience.endYear ?? undefined,
    })),
    socialLinks: user.socialLinks[0] ?? {},
    certifications: user.certifications,
    education: education.map((item) => ({
      ...item,
      endYear: item.endYear ?? undefined,
      description: item.description ?? undefined,
    })),
  } satisfies Omit<PortfolioInitialData, "isOwner"> & { id: string };
}
