import { NextRequest, NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET(req: NextRequest) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json([]);
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const admin = searchParams.get("admin");

    const filter: Record<string, unknown> = {};
    if (!admin) filter.visible = true;
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;

    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { verifyToken, getAuthHeader } = await import("@/lib/auth");
    const token = getAuthHeader(req.headers);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await connectDB();
    const body = await req.json();
    const project = await Project.create(body);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { verifyToken, getAuthHeader } = await import("@/lib/auth");
    const token = getAuthHeader(req.headers);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await connectDB();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const reorder = searchParams.get("reorder");

    if (reorder === "true") {
      const { items } = body as { items: { id: string; order: number }[] };
      for (const item of items) {
        await Project.findByIdAndUpdate(item.id, { order: item.order });
      }
      return NextResponse.json({ success: true });
    }

    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }
    const project = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { verifyToken, getAuthHeader } = await import("@/lib/auth");
    const token = getAuthHeader(req.headers);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
