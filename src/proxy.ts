import { config as envConfig } from "@/config/env";
import { getToken, type JWT } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { type NextRequest, NextResponse } from "next/server";

export default withAuth(
  async function proxy(request: NextRequest) {
    const ua = request.headers.get("user-agent") || "unknown";
    console.log("userAgent : ", new Date().toLocaleTimeString(), ua);

    const response = NextResponse.next();

    response.cookies.set("oauth_ua", ua, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 5,
    });

    const { pathname } = request.nextUrl;

    // Ensure NEXTAUTH_SECRET is set
    const secret = envConfig.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("NEXTAUTH_SECRET not configured");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    let token: JWT | null = null;
    try {
      token = await getToken({
        req: request,
        secret: secret,
      });
    } catch (error) {
      console.error("Error retrieving token:", error);
      // Continue without token, let withAuth handle authentication
    }

    if (
      pathname === "/" ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/courses") ||
      pathname.startsWith("/instructors") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/alo")
    ) {
      return NextResponse.next();
    }

    if (token && token?.["error"]) {
      return NextResponse.redirect(new URL(`/auth/signin`, request.url));
    }

    if (token?.["status"] === "SUSPENDED") {
      return NextResponse.redirect(new URL("/account/suspended", request.url));
    }

    if (token?.["status"] === "PENDING_VERIFICATION" && !pathname.startsWith("/verify")) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }

    // Role-based access control
    const userRole = token?.["role"];
    const rolesArray = Array.isArray(userRole) ? userRole : [userRole];

    if (pathname.startsWith("/dashboard/student") && !rolesArray.includes("STUDENT")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/dashboard/instructor") && !rolesArray.includes("INSTRUCTOR")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && !rolesArray.includes("ADMIN")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // 7. Security Headers Hardening
    try {
      addSecurityHeaders(response);
    } catch (error) {
      console.error("Failed to add security headers:", error);
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        const isPublicRoute =
          path === "/" ||
          path.startsWith("/auth") ||
          path.startsWith("/courses") ||
          path.startsWith("/instructors") ||
          path.startsWith("/studentHub") ||
          path.startsWith("/books") ||
          path.startsWith("/events") ||
          path.startsWith("/challenges") ||
          path.startsWith("/community") ||
          path.startsWith("/career") ||
          path.startsWith("/earn") ||
          path.startsWith("/success") ||
          path.startsWith("/help") ||
          path.startsWith("/about") ||
          path.startsWith("/products") ||
          path.startsWith("/alo");

        if (isPublicRoute) {
          return true;
        }

        return !!token;
      },
    },
  }
);

function addSecurityHeaders(response: NextResponse) {
  const cspDirectives = [
    "default-src 'self' https://iframe.mediadelivery.net",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com http://assets.mediadelivery.net unpkg.com",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    // Added Google and Railway backend
    `connect-src 'self' https://alobackendskill.aloskill.com ${envConfig.NEXT_PUBLIC_BACKEND_BASE_URL} https://vitals.vercel-insights.com https://video.bunnycdn.com https://fortunate-kindness-production.up.railway.app https://accounts.google.com https://assets.mediadelivery.net https://sg.storage.bunnycdn.com https://aloskill-pull-zone-7.b-cdn.net blob: unpkg.com`,
    "media-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "frame-src 'self' https://accounts.google.com https://iframe.mediadelivery.net",
    "frame-ancestors 'none'",
  ];

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (envConfig.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
}

// function getClientIP(request: NextRequest): string {
//   const forwarded = request.headers.get("x-forwarded-for");
//   const realIP = request.headers.get("x-real-ip");
//   const cfConnectingIP = request.headers.get("cf-connecting-ip");

//   const forwardedIp = forwarded?.split(",")[0]?.trim() || "";

//   return cfConnectingIP || forwardedIp || realIP || "unknown";
// }

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/auth).*)"],
};
