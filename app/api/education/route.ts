import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

async function saveEducation(req: NextRequest) {
  const isUpdate = req.method === "PUT";
  try {
    const userId = (await getSession(req))?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication token is missing" },
        { status: 401 },
      );
    }

    const { id, school, degree, field, startYear, endYear, isCurrently, description } = await req.json();
    if ((isUpdate && !id) || !school || !degree || !field || !startYear) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!isUpdate && await db.education.count({ where: { userId } }) >= 2) {
      return NextResponse.json(
        { success: false, error: "You can add up to two education entries" },
        { status: 409 },
      );
    }

    const data = {
      school,
      degree,
      field,
      startYear: parseInt(startYear),
      endYear: endYear ? parseInt(endYear) : null,
      isCurrently: isCurrently || false,
      description: description || null,
    };
    const education = isUpdate
      ? await db.education.update({ where: { id, userId }, data })
      : await db.education.create({ data: { ...data, userId } });
    return NextResponse.json({ success: true, education });
  } catch (error) {
    console.error(`Error ${isUpdate ? "updating" : "adding"} education:`, error);
    return NextResponse.json(
      { success: false, error: `Failed to ${isUpdate ? "update" : "add"} education` },
      { status: 500 },
    );
  }
}

export { saveEducation as POST, saveEducation as PUT };
