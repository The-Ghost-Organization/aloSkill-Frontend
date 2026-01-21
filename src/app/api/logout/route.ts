
import { authService } from "@/lib/api/auth.service.ts";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

async function logoutCurrentDevice(refreshToken: string) {
  const logoutResponse = await authService.logoutCurrentDevice(refreshToken);
  return logoutResponse;
}

async function logoutAllDevices(refreshToken: string) {
  const logoutallResponse = await authService.logoutAllDevices(refreshToken);
  return logoutallResponse;
}

export async function POST(request: Request) {
  let logoutAll = false;
  try {
    const body = await request.json();
    logoutAll = !!body.logoutAll;
  } catch (_e) {
    // console.error("Failed to parse request body:", e);
  }
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET as string,
  });

  if (!token) {
    return NextResponse.json(
      { message: "No active session token found.", success: true },
      { status: 200 }
    );
  }

  const refreshToken = token["refreshToken"] as string;

  try {
    if (logoutAll) {
      await logoutAllDevices(refreshToken);
    } else {
      await logoutCurrentDevice(refreshToken);
    }
  } catch (_error) {
    // console.error(`Backend Revocation Failed:`, error);
  }
  return NextResponse.json({ success: true, message: "Revocation processed." }, { status: 200 });
}
