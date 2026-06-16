import { NextRequest, NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import Service from "@/models/Service";

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

    const services = await Service.find(filter).sort({ order: 1 });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Get services error:", error);
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
    const service = await Service.create(body);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Create service error:", error);
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
    if (!id) return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    const service = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json(service);
  } catch (error) {
    console.error("Update service error:", error);
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
    if (!id) return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    const service = await Service.findByIdAndDelete(id);
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
