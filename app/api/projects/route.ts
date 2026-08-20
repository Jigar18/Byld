import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  deleteProjectImage,
  deleteProjectVideo,
  getVerifiedProjectImage,
  getVerifiedProjectVideo,
} from "@/lib/cloudinary";
import { portfolioLookupStatus, resolvePortfolioUser } from "@/lib/publicPortfolio";
import { getRequestUserId } from "@/lib/session";

type ProjectInput = {
  id?: string;
  title?: unknown;
  description?: unknown;
  techStack?: unknown;
  githubUrl?: unknown;
  liveUrl?: unknown;
  videoUrl?: unknown;
  videoPublicId?: unknown;
  videoDuration?: unknown;
  videoBytes?: unknown;
  videoFormat?: unknown;
  images?: unknown;
};

const MAX_PROJECTS = 4;
const isWebUrl = (value: string | null) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const mergeSkills = (currentSkills: string[], projectSkills: string[]) => {
  const merged = [...currentSkills];
  for (const skill of projectSkills) {
    if (merged.some((current) => current.toLowerCase() === skill.toLowerCase())) continue;
    merged.push(skill.charAt(0).toUpperCase() + skill.slice(1));
  }
  return merged;
};

async function addProjectSkillsToPortfolio(
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

async function parseProject(body: ProjectInput, userId: string) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const techStack = Array.isArray(body.techStack)
    ? body.techStack.filter((skill): skill is string => typeof skill === "string" && skill.trim().length > 0).map((skill) => skill.trim())
    : [];
  const githubUrl = typeof body.githubUrl === "string" && body.githubUrl.trim() ? body.githubUrl.trim() : null;
  const liveUrl = typeof body.liveUrl === "string" && body.liveUrl.trim() ? body.liveUrl.trim() : null;
  if (
    !title ||
    !description ||
    title.length > 120 ||
    description.length > 5_000 ||
    techStack.length > 30 ||
    techStack.some((skill) => skill.length > 80) ||
    (githubUrl?.length ?? 0) > 2_048 ||
    (liveUrl?.length ?? 0) > 2_048 ||
    !isWebUrl(githubUrl) ||
    !isWebUrl(liveUrl)
  ) {
    throw new Error("Project details are invalid");
  }
  const hasVideo = [body.videoUrl, body.videoPublicId, body.videoDuration, body.videoBytes, body.videoFormat]
    .some((value) => value !== null && value !== undefined && value !== "");
  let video = { videoUrl: null as string | null, videoPublicId: null as string | null, videoDuration: null as number | null, videoBytes: null as number | null, videoFormat: null as string | null };

  if (hasVideo) {
    const videoPublicId = typeof body.videoPublicId === "string" ? body.videoPublicId.trim() : "";
    if (!videoPublicId) throw new Error("Project video not found");
    video = await getVerifiedProjectVideo(videoPublicId, userId);
  }

  const requestedImages = Array.isArray(body.images) ? body.images : [];
  if (requestedImages.length > 5) throw new Error("A project can have up to 5 images");
  const positions = new Set<number>();
  const images = await Promise.all(requestedImages.map(async (image) => {
    const input = image as { imagePublicId?: unknown; position?: unknown };
    const imagePublicId = typeof input.imagePublicId === "string" ? input.imagePublicId.trim() : "";
    const position = typeof input.position === "number" ? input.position : -1;
    if (!imagePublicId || !Number.isInteger(position) || position < 0 || position > 4 || positions.has(position)) {
      throw new Error("Project image positions are invalid");
    }
    positions.add(position);
    return { ...await getVerifiedProjectImage(imagePublicId, userId), position };
  }));

  return { project: { title, description, techStack, githubUrl, liveUrl, ...video }, images };
}

async function removeReplacedVideo(publicId: string | null | undefined) {
  if (!publicId) return;
  try {
    await deleteProjectVideo(publicId);
  } catch (error) {
    console.error("Unable to clean up replaced project video:", error);
  }
}

async function removeProjectImages(publicIds: string[]) {
  await Promise.all(publicIds.map(async (publicId) => {
    try {
      await deleteProjectImage(publicId);
    } catch (error) {
      console.error("Unable to clean up project image:", error);
    }
  }));
}

export async function GET(request: NextRequest) {
  try {
    const user = await resolvePortfolioUser(request);
    if (!user) return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: portfolioLookupStatus(request) });
    const projects = await db.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" } } },
    });
    return NextResponse.json({ success: true, projects });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to load projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: "Authentication token is missing" }, { status: 401 });
    const projectCount = await db.project.count({ where: { userId } });
    if (projectCount >= MAX_PROJECTS) {
      return NextResponse.json(
        { success: false, error: `A maximum of ${MAX_PROJECTS} projects is allowed` },
        { status: 409 },
      );
    }
    const parsed = await parseProject(await request.json(), userId);
    const { project, skills } = await db.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: { ...parsed.project, userId, images: { create: parsed.images } },
        include: { images: { orderBy: { position: "asc" } } },
      });
      const skills = await addProjectSkillsToPortfolio(tx, userId, parsed.project.techStack);
      return { project, skills };
    });
    return NextResponse.json({ success: true, project, skills }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to create project" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    const body = (await request.json()) as ProjectInput;
    if (!userId || !body.id) return NextResponse.json({ success: false, error: "Project not found" }, { status: 401 });
    const existing = await db.project.findFirst({ where: { id: body.id, userId }, include: { images: true } });
    if (!existing) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    const parsed = await parseProject(body, userId);
    const { project: updated, skills } = await db.$transaction(async (tx) => {
      await tx.project.update({ where: { id: body.id }, data: parsed.project });
      await tx.projectImage.deleteMany({ where: { projectId: body.id } });
      if (parsed.images.length) await tx.projectImage.createMany({ data: parsed.images.map((image) => ({ ...image, projectId: body.id! })) });
      const project = await tx.project.findUnique({ where: { id: body.id }, include: { images: { orderBy: { position: "asc" } } } });
      const skills = await addProjectSkillsToPortfolio(tx, userId, parsed.project.techStack);
      return { project, skills };
    });
    if (existing.videoPublicId && existing.videoPublicId !== parsed.project.videoPublicId) {
      await removeReplacedVideo(existing.videoPublicId);
    }
    const retainedImageIds = new Set(parsed.images.map((image) => image.imagePublicId));
    await removeProjectImages(existing.images.filter((image) => !retainedImageIds.has(image.imagePublicId)).map((image) => image.imagePublicId));
    return NextResponse.json({ success: true, project: updated, skills });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to update project" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    const id = request.nextUrl.searchParams.get("id");
    if (!userId || !id) return NextResponse.json({ success: false, error: "Project not found" }, { status: 401 });
    const existing = await db.project.findFirst({ where: { id, userId }, select: { videoPublicId: true, images: { select: { imagePublicId: true } } } });
    const result = await db.project.deleteMany({ where: { id, userId } });
    if (!result.count) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    await removeReplacedVideo(existing?.videoPublicId);
    await removeProjectImages(existing?.images.map((image) => image.imagePublicId) || []);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to delete project" }, { status: 500 });
  }
}
