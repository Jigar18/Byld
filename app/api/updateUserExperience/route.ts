import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required"
      }, { status: 401 });
    }

    const body = await req.json();
    const { 
      company, 
      position, 
      startMonth, 
      startYear, 
      endMonth, 
      endYear, 
      isCurrentRole, 
      contributions 
    } = body;

    // Validate required fields
    if (!company || !position || !startMonth || !startYear) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Create new experience entry
    const experience = await db.experience.create({
      data: {
        company,
        position,
        startMonth,
        startYear,
        endMonth: isCurrentRole ? null : endMonth,
        endYear: isCurrentRole ? null : endYear,
        isCurrentRole,
        contributions: contributions || [],
        userId: session.userId,
      }
    });

    return NextResponse.json({
      success: true,
      experience: experience
    });

  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create experience" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required"
      }, { status: 401 });
    }

    const body = await req.json();
    const { 
      id,
      company, 
      position, 
      startMonth, 
      startYear, 
      endMonth, 
      endYear, 
      isCurrentRole, 
      contributions 
    } = body;

    // Validate required fields
    if (!id || !company || !position || !startMonth || !startYear) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Update existing experience entry
    const experience = await db.experience.update({
      where: {
        id: id,
        userId: session.userId,
      },
      data: {
        company,
        position,
        startMonth,
        startYear,
        endMonth: isCurrentRole ? null : endMonth,
        endYear: isCurrentRole ? null : endYear,
        isCurrentRole,
        contributions: contributions || [],
      }
    });

    return NextResponse.json({
      success: true,
      experience: experience
    });

  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update experience" 
      },
      { status: 500 }
    );
  }
}

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
        id: id,
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
