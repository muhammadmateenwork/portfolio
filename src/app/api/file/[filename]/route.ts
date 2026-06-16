import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// MIME type map for common file types
const mimeTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // The filename may contain subfolder path like "portfolio/resumes/123-abc.pdf"
    // We need to safely resolve it within the uploads directory
    const filePath = path.join(UPLOADS_DIR, filename);

    // Security: ensure the resolved path is within UPLOADS_DIR
    const resolvedPath = path.resolve(filePath);
    const resolvedUploads = path.resolve(UPLOADS_DIR);
    if (!resolvedPath.startsWith(resolvedUploads)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if file exists
    try {
      await stat(resolvedPath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(resolvedPath);

    // Determine content type
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    // For PDFs, set Content-Disposition to inline so they display in browser
    // but also make them downloadable
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    if (ext === ".pdf") {
      // Allow PDFs to be viewed inline in the browser
      headers["Content-Disposition"] = `inline; filename="${path.basename(resolvedPath)}"`;
    }

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
