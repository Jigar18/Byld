import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

async function saveExperience(req: NextRequest) {
  const isUpdate = req.method === "PUT";
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { id, company, position, startMonth, startYear, endMonth, endYear, isCurrentRole, contributions } = await req.json();
    if ((isUpdate && !id) || !company || !position || !startMonth || !startYear) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const data = {
      company,
      position,
      startMonth,
      startYear,
      endMonth: isCurrentRole ? null : endMonth,
      endYear: isCurrentRole ? null : endYear,
      isCurrentRole,
      contributions: contributions || [],
    };
    const experience = isUpdate
      ? await db.experience.update({ where: { id, userId: session.userId }, data })
      : await db.experience.create({ data: { ...data, userId: session.userId } });
    return NextResponse.json({ success: true, experience });
  } catch (error) {
    console.error(`Error ${isUpdate ? "updating" : "creating"} experience:`, error);
    return NextResponse.json(
      { success: false, error: `Failed to ${isUpdate ? "update" : "create"} experience` },
      { status: 500 },
    );
  }
}

export { saveExperience as POST, saveExperience as PUT };

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required"
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Experience ID is required" 
      }, { status: 400 });
    }

    // Delete experience entry
    await db.experience.delete({
      where: {
        id,
        userId: session.userId,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Experience deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete experience" 
      },
      { status: 500 }
    );
  }
}
