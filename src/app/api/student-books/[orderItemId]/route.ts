import crypto from "crypto";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api/client";
import { authOptions } from "../../auth/[...nextauth]/route";

type EbookAccessPayload = {
  success: boolean;
  message?: string;
  data?: {
    orderItemId: string;
    bookId: string;
    title: string;
    fileName: string;
    url: string;
  };
};

function generateBunnyTokenUrl(cdnUrl: string, securityKey: string, expirationInSeconds = 300) {
  if (!securityKey) return cdnUrl;

  const url = new URL(cdnUrl);
  if (url.searchParams.has("token") && url.searchParams.has("expires")) return cdnUrl;

  const expires = Math.floor(Date.now() / 1000) + expirationInSeconds;
  const hashableBase = securityKey + url.pathname + expires;
  const token = crypto
    .createHash("md5")
    .update(hashableBase)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  url.searchParams.set("token", token);
  url.searchParams.set("expires", String(expires));
  return url.toString();
}

function safeFileName(value: string) {
  const cleaned = value.replace(/[\\/:*?"<>|\r\n]+/g, "_").trim();
  return cleaned || "ebook.pdf";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderItemId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { orderItemId } = await params;
  const mode = request.nextUrl.searchParams.get("mode") === "download" ? "download" : "read";

  const accessResponse = await fetch(
    `${API_BASE_URL}/book/user/library/${encodeURIComponent(orderItemId)}/ebook-file`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const accessPayload = (await accessResponse.json()) as EbookAccessPayload;
  if (!accessResponse.ok || !accessPayload.success || !accessPayload.data?.url) {
    return new NextResponse(accessPayload.message || "eBook access was denied.", {
      status: accessResponse.status || 403,
    });
  }

  const sourceUrl = generateBunnyTokenUrl(
    accessPayload.data.url,
    process.env["BUNNY_SECURITY_KEY"] || ""
  );

  const sourceHeaders = new Headers();
  const range = request.headers.get("range");
  if (range) sourceHeaders.set("Range", range);

  const sourceResponse = await fetch(sourceUrl, {
    headers: sourceHeaders,
    cache: "no-store",
  });

  if (!sourceResponse.ok && sourceResponse.status !== 206) {
    return new NextResponse("Unable to load the purchased eBook file.", {
      status: sourceResponse.status,
    });
  }

  const fileName = safeFileName(accessPayload.data.fileName || `${accessPayload.data.title}.pdf`);
  const headers = new Headers();
  headers.set("Content-Type", sourceResponse.headers.get("content-type") || "application/pdf");
  headers.set(
    "Content-Disposition",
    `${mode === "download" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(fileName)}`
  );
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");

  for (const header of ["accept-ranges", "content-range", "content-length"]) {
    const value = sourceResponse.headers.get(header);
    if (value) headers.set(header, value);
  }

  return new NextResponse(sourceResponse.body, {
    status: sourceResponse.status,
    headers,
  });
}
