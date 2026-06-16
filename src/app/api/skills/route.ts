import { NextRequest, NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import Skill from "@/models/Skill";

export async function GET(req: NextRequest) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json([]);
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get("admin");
    const category = searchParams.get("category");

    const filter: Record<string, unknown> = {};
    if (!admin) filter.visible = true;
    if (category) filter.category = category;

    const skills = await Skill.find(filter).sort({ order: 1 });
    return NextResponse.json(skills);
  } catch (error) {
    console.error("Get skills error:", error);
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
    const skill = await Skill.create(body);
    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Create skill error:", error);
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Skill ID is required" }, { status: 400 });
    }

    const skill = await Skill.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    return NextResponse.json(skill);
  } catch (error) {
    console.error("Update skill error:", error);
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
      return NextResponse.json({ error: "Skill ID is required" }, { status: 400 });
    }

    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete skill error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
