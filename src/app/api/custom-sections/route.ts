import { NextRequest, NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import CustomSection from "@/models/CustomSection";

export async function GET(req: NextRequest) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json([]);
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get("admin");

    const filter: Record<string, unknown> = {};
    if (!admin) filter.visible = true;

    const sections = await CustomSection.find(filter).sort({ order: 1 });
    return NextResponse.json(sections);
  } catch (error) {
    console.error("Get custom sections error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { verifyToken, getAuthHeader } = await import("@/lib/auth");
    const token = getAuthHeader(req.headers);
    if (!token || !verifyToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isMongoConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    await connectDB();
    const body = await req.json();
    const section = await CustomSection.create(body);
    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Create custom section error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { verifyToken, getAuthHeader } = await import("@/lib/auth");
    const token = getAuthHeader(req.headers);
    if (!token || !verifyToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isMongoConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "Section ID is required" }, { status: 400 });
    const section = await CustomSection.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });
    return NextResponse.json(section);
  } catch (error) {
    console.error("Update custom section error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { verifyToken, getAuthHeader } = await import("@/lib/auth");
    const token = getAuthHeader(req.headers);
    if (!token || !verifyToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isMongoConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Section ID is required" }, { status: 400 });
    const section = await CustomSection.findByIdAndDelete(id);
    if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete custom section error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
