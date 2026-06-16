import { NextRequest, NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import { defaultSettings } from "@/lib/defaults";

export async function GET() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(defaultSettings);
    }

    await connectDB();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      // Create empty settings on first access
      settings = await SiteSettings.create(defaultSettings);
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(defaultSettings);
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
      return NextResponse.json({ error: "Database not configured. Please set MONGO_URI." }, { status: 503 });
    }

    await connectDB();
    const body = await req.json();
    const settings = await SiteSettings.findOne();

    if (!settings) {
      const newSettings = await SiteSettings.create(body);
      return NextResponse.json(newSettings);
    }

    Object.assign(settings, body);
    await settings.save();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
