// app/api/pdf-proxy/route.ts
import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";

// Function to generate Bunny CDN Token URL
function generateBunnyTokenUrl(cdnUrl: string, securityKey: string, expirationInSeconds = 3600) {
  const urlObj = new URL(cdnUrl);
  const expires = Math.floor(Date.now() / 1000) + expirationInSeconds;
  const path = urlObj.pathname;

  const hashableBase = securityKey + path + expires;
  const token = crypto
    .createHash("md5")
    .update(hashableBase)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${cdnUrl}?token=${token}&expires=${expires}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // Sign the URL server-side using your Bunny Security Key
    const signedUrl = generateBunnyTokenUrl(rawUrl, process.env["BUNNY_SECURITY_KEY"] || "");

    const response = await fetch(signedUrl);

    if (!response.ok) {
      return new NextResponse(`Bunny Fetch Failed: ${response.statusText}`, {
        status: response.status,
      });
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    return new NextResponse(err.message || "Proxy Error", { status: 500 });
  }
}
