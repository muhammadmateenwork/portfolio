import { NextRequest, NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!isMongoConfigured()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await connectDB();
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
