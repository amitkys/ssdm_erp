import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the Cloudinary public_id from a secure URL.
 * Example URL: https://res.cloudinary.com/<cloud>/image/upload/v123/student-registration/1234-filename.webp
 * Returns: "student-registration/1234-filename"
 */
function extractPublicId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/");

    // Find the "upload" segment and take everything after it (skipping version like v123...)
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // Skip the version segment (e.g., "v1234567890")
    const afterUpload = parts.slice(uploadIndex + 1);
    const startIndex = afterUpload[0]?.startsWith("v") ? 1 : 0;
    const pathWithExt = afterUpload.slice(startIndex).join("/");

    // Remove the file extension
    const lastDot = pathWithExt.lastIndexOf(".");
    return lastDot !== -1 ? pathWithExt.substring(0, lastDot) : pathWithExt;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing or invalid 'url' field" },
        { status: 400 },
      );
    }

    const publicId = extractPublicId(url);
    if (!publicId) {
      return NextResponse.json(
        { success: false, message: "Could not extract public_id from URL" },
        { status: 400 },
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: `Cloudinary delete failed: ${result.result}` },
      { status: 500 },
    );
  } catch (error: any) {
    console.error("[Cloudinary Delete Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error during file deletion",
      },
      { status: 500 },
    );
  }
}
