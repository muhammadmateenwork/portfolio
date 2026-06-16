import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Configure Cloudinary with env vars
function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Initialize Cloudinary config
function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    // Verify auth
    const { verifyToken, getAuthHeader } = await import("@/lib/auth");
    const token = getAuthHeader(req.headers);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "portfolio";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // If Cloudinary is configured, upload there
    if (isCloudinaryConfigured()) {
      initCloudinary();

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/png";
      const base64 = buffer.toString("base64");
      const dataUri = `data:${mimeType};base64,${base64}`;

      // Determine resource type based on mime type
      const isImage = mimeType.startsWith("image/");
      const isVideo = mimeType.startsWith("video/");
      const resourceType = isVideo ? "video" : "auto";

      try {
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: folder,
          resource_type: resourceType,
          // For images, apply optimization transformations
          ...(isImage
            ? {
                quality: "auto:good",
                fetch_format: "auto",
              }
            : {}),
        });

        console.log(`Cloudinary upload success: ${result.secure_url} (public_id: ${result.public_id})`);

        return NextResponse.json(
          {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          },
          { status: 201 }
        );
      } catch (uploadError: unknown) {
        const errMsg = uploadError instanceof Error ? uploadError.message : "Unknown error";
        console.error("Cloudinary upload error:", errMsg);
        return NextResponse.json(
          { error: `Cloudinary upload failed: ${errMsg}` },
          { status: 500 }
        );
      }
    }

    // No Cloudinary — save file to local uploads directory (fallback)
    console.warn("Cloudinary not configured — saving file locally. Set CLOUDINARY env vars for cloud storage.");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".png");
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const subDir = path.join(UPLOADS_DIR, folder);

    // Ensure directory exists
    await mkdir(subDir, { recursive: true });

    const filePath = path.join(subDir, uniqueName);
    await writeFile(filePath, buffer);

    // Return a URL that can be served by our /api/file route
    const url = `/api/file/${folder}/${uniqueName}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// DELETE endpoint to remove an image from Cloudinary
export async function DELETE(req: NextRequest) {
  try {
    const { verifyToken, getAuthHeader } = await import("@/lib/auth");
    const token = getAuthHeader(req.headers);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 503 });
    }

    initCloudinary();

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Delete from Cloudinary error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
