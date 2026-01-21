import { config as envConfig } from "@/config/env";
import { getToken, type JWT } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { type NextRequest, NextResponse } from "next/server";
import {
  auditLogger,
  contentValidator,
  rateLimiter,
  securityScanner,
  threatIntelligence,
} from "./lib/security-modules";

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    AUTH: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
    VIDEO: { max: 20, windowMs: 60 * 1000 }, // 20 requests per minute
    API: { max: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    EXAM: { max: 10, windowMs: 30 * 1000 }, // 10 requests per 30 sec
    DEFAULT: { max: 200, windowMs: 60 * 1000 },
  },

  // Security thresholds
  THREAT_LEVELS: {
    LOW: "log",
    MEDIUM: "challenge",
    HIGH: "block",
    CRITICAL: "block_ban",
  },

  // LMS-specific settings
  LMS: {
    MAX_CONCURRENT_VIDEOS: 3,
    EXAM_ACCESS_WINDOW: 30 * 60 * 1000, // 30 minutes
    VIDEO_TOKEN_EXPIRY: 2 * 60 * 60 * 1000, // 2 hours
  },
};

export default withAuth(
  async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const { pathname, searchParams } = request.nextUrl;
    const clientIP = getClientIP(request);

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
      pathname.startsWith("/about")
    ) {
      return NextResponse.next();
    }

    if (token && token?.["error"] == "RefreshAccessTokenError") {
      return NextResponse.redirect(new URL(`/auth/signin`, request.url));
    }

    // Role-based access control
    if (
      pathname.startsWith("/dashboard/student") &&
      !(token?.["role"] && Array.isArray(token["role"]) && token["role"].includes("STUDENT"))
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // if (pathname.startsWith("/dashboard/instructor") && token?.["role"] !== "INSTRUCTOR")

    if (
      pathname.startsWith("/dashboard/instructor") &&
      !(token?.["role"] && Array.isArray(token["role"]) && token["role"].includes("INSTRUCTOR"))
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (
      pathname.startsWith("/admin") &&
      !(token?.["role"] && Array.isArray(token["role"]) && token["role"].includes("ADMIN"))
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Check account status
    if (token?.["status"] === "SUSPENDED") {
      return NextResponse.redirect(new URL("/account/suspended", request.url));
    }

    if (token?.["status"] === "PENDING_VERIFICATION" && !pathname.startsWith("/verify")) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }

    // Start security audit
    let auditId: string;
    try {
      auditId = await auditLogger.startAudit(request);
    } catch (error) {
      console.error("Failed to start audit:", error);
      // Continue without audit ID, but log the error
      auditId = `error_${Date.now()}`;
    }

    try {
      // === PHASE 1: PRE-AUTHENTICATION SECURITY ===

      // 1. Geo-blocking & Regional Compliance
      let geoCheck;
      try {
        geoCheck = await threatIntelligence.checkGeoLocation(request);
        if (!geoCheck.allowed) {
          await auditLogger.logThreat(auditId, "geo_blocked", geoCheck);
          return blockResponse(request, "Service not available in your region", 451);
        }
      } catch (error) {
        console.error("Geo-check failed:", error);
        // Continue if geo-check fails, but log
        await auditLogger.logError(auditId, error, request);
      }

      // 2. IP Reputation & Threat Intelligence
      let ipReputation;
      try {
        ipReputation = await threatIntelligence.checkIPReputation(clientIP);
        if (ipReputation && ipReputation.riskScore > 70) {
          await auditLogger.logThreat(auditId, "malicious_ip", ipReputation as any);
          return blockResponse(request, "Access denied", 403);
        }
      } catch (error) {
        console.error("IP reputation check failed:", error);
        await auditLogger.logError(auditId, error, request);
      }

      // 3. Advanced Threat Detection
      let threatScan;
      try {
        threatScan = await securityScanner.comprehensiveScan(request);
        if (threatScan && threatScan.isThreat) {
          await handleThreatResponse(threatScan, request, auditId);

          if (threatScan.riskLevel === "critical" || threatScan.riskLevel === "high") {
            return blockResponse(request, "Security threat detected", 403);
          }
        }
      } catch (error) {
        console.error("Threat scan failed:", error);
        await auditLogger.logError(auditId, error, request);
      }

      // 4. Multi-layer Rate Limiting
      let rateLimitResult;
      try {
        rateLimitResult = await rateLimiter.checkMultiLayer(request);
        if (rateLimitResult && rateLimitResult.blocked) {
          await auditLogger.logThreat(auditId, "rate_limit_exceeded", rateLimitResult as any);
          return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
              "Retry-After": rateLimitResult.retryAfter,
              "X-RateLimit-Limit": rateLimitResult.limit.toString(),
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            },
          });
        }
      } catch (error) {
        console.error("Rate limiting failed:", error);
        await auditLogger.logError(auditId, error, request);
        // Allow request to continue if rate limiting fails
      }

      // === PHASE 2: AUTHENTICATION & SESSION SECURITY ===

      // 5. Session Security & Anomaly Detection
      if (token) {
        try {
          const sessionCheck = await validateSessionSecurity(token, request);
          if (!sessionCheck.valid) {
            await auditLogger.logThreat(auditId, "session_anomaly", sessionCheck);
            return NextResponse.redirect(
              new URL(
                `/auth/signout?reason=security&anomaly=${sessionCheck["anomaly"]}`,
                request.url
              )
            );
          }

          // Update session activity
          await updateSessionActivity(token, request);
        } catch (error) {
          console.error("Session validation failed:", error);
          await auditLogger.logError(auditId, error, request);
          // Allow request to continue
        }
      }

      // 6. Advanced Access Control
      try {
        const accessControl = await enforceAccessControl(request, token);
        if (!accessControl.granted) {
          await auditLogger.logAccessViolation(auditId, request, token, accessControl);
          return NextResponse.redirect(new URL(accessControl.redirectUrl, request.url));
        }
      } catch (error) {
        console.error("Access control failed:", error);
        await auditLogger.logError(auditId, error, request);
        // Allow request to continue
      }

      // === PHASE 3: LMS-SPECIFIC CONTENT SECURITY ===

      // 7. Video Content Protection
      if (pathname.includes("/video/")) {
        try {
          const videoSecurity = await enforceVideoSecurity(request, token, searchParams);
          if (!videoSecurity.allowed) {
            await auditLogger.logThreat(auditId, "video_access_violation", videoSecurity);
            return blockResponse(request, "Video access denied", 403);
          }

          // Add video-specific security headers
          addVideoSecurityHeaders(response);
        } catch (error) {
          console.error("Video security check failed:", error);
          await auditLogger.logError(auditId, error, request);
          return blockResponse(request, "Video access verification failed", 500);
        }
      }

      // 8. Document & PDF Protection
      if (pathname.includes("/document/") || pathname.includes("/pdf/")) {
        try {
          const documentSecurity = await contentValidator.validateContentAccess(request, token);
          if (!documentSecurity.granted) {
            return NextResponse.redirect(
              new URL("/dashboard?error=document_access_denied", request.url)
            );
          }

          addDocumentSecurityHeaders(response, documentSecurity);
        } catch (error) {
          console.error("Document security check failed:", error);
          await auditLogger.logError(auditId, error, request);
          return NextResponse.redirect(
            new URL("/dashboard?error=document_access_error", request.url)
          );
        }
      }

      // 9. Exam & Assessment Security
      if (pathname.includes("/exam/") || pathname.includes("/assessment/")) {
        try {
          const examSecurity = await enforceExamSecurity(request, token, searchParams);
          if (!examSecurity.valid) {
            await auditLogger.logThreat(auditId, "exam_security_violation", examSecurity);
            return NextResponse.redirect(
              new URL("/dashboard?error=exam_access_denied", request.url)
            );
          }

          addExamSecurityHeaders(response);
        } catch (error) {
          console.error("Exam security check failed:", error);
          await auditLogger.logError(auditId, error, request);
          return NextResponse.redirect(new URL("/dashboard?error=exam_access_error", request.url));
        }
      }

      // 10. Course Content Access Validation
      if (pathname.startsWith("/learn/") || pathname.startsWith("/course/")) {
        try {
          const contentAccess = await contentValidator.validateContentAccess(request, token);
          if (!contentAccess.granted) {
            await auditLogger.logAccessViolation(auditId, request, token, contentAccess);
            return NextResponse.redirect(
              new URL("/dashboard?error=content_access_denied", request.url)
            );
          }
        } catch (error) {
          console.error("Content access validation failed:", error);
          await auditLogger.logError(auditId, error, request);
          return NextResponse.redirect(
            new URL("/dashboard?error=content_access_error", request.url)
          );
        }
      }

      // === PHASE 4: RESPONSE SECURITY HARDENING ===

      // 11. Advanced Security Headers
      try {
        addAdvancedSecurityHeaders(response, request);
      } catch (error) {
        console.error("Failed to add security headers:", error);
        // Continue without headers
      }

      // 12. LMS-Specific Security Headers
      try {
        addLMSSpecificHeaders(response, pathname);
      } catch (error) {
        console.error("Failed to add LMS headers:", error);
      }

      // 13. Real-time Monitoring Headers
      try {
        addMonitoringHeaders(response, auditId);
      } catch (error) {
        console.error("Failed to add monitoring headers:", error);
      }

      // Success audit
      try {
        await auditLogger.logSuccess(auditId, request, token);
      } catch (error) {
        console.error("Failed to log success:", error);
      }

      return response;
    } catch (error) {
      // Security failure handling
      console.error("Middleware error:", error);

      try {
        if (auditId) {
          await auditLogger.logError(auditId, error, request);
        }
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }

      // Don't leak error details in production
      if (envConfig.NODE_ENV === "production") {
        return new NextResponse("Security verification failed", { status: 500 });
      }

      throw error;
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        const isPublicRoute =
          path === "/" ||
          path.startsWith("/auth") ||
          path.startsWith("/courses") ||
          path.startsWith("/about") ||
          path.startsWith("/products") ||
          path.startsWith("/instructors");

        if (isPublicRoute) {
          return true;
        }

        return !!token;
      },
    },
  }
);

// === SECURITY MODULE IMPLEMENTATIONS ===

/**
 * Advanced Session Security Validation
 */
async function validateSessionSecurity(
  token: any,
  request: NextRequest
): Promise<SessionValidationResult> {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent");
  const now = Date.now();

  // Check for session anomalies
  const anomalies: string[] = [];

  // 1. IP Address Change Detection
  if (token.sessionIP && token.sessionIP !== clientIP) {
    anomalies.push("ip_change");
  }

  // 2. User Agent Change Detection
  if (token.sessionUA && token.sessionUA !== userAgent) {
    anomalies.push("user_agent_change");
  }

  // 3. Session Age Check
  if (token.iat && now - token.iat * 1000 > 24 * 60 * 60 * 1000) {
    anomalies.push("session_expired");
  }

  // 4. Concurrent Session Check
  const concurrentSessions = await checkConcurrentSessions(token.id);
  if (concurrentSessions > 3) {
    anomalies.push("concurrent_sessions");
  }

  // 5. Geographic Anomaly Detection
  const geoAnomaly = await detectGeographicAnomaly(token, request);
  if (geoAnomaly.detected) {
    anomalies.push("geographic_anomaly");
  }

  return {
    valid: anomalies.length === 0,
    anomalies,
    riskLevel: anomalies.length > 2 ? "high" : anomalies.length > 0 ? "medium" : "low",
  };
}

/**
 * Advanced Access Control for LMS
 */
async function enforceAccessControl(
  request: NextRequest,
  token: any
): Promise<AccessControlResult> {
  const { pathname, searchParams } = request.nextUrl;

  // Public routes (no authentication required)
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/pricing",
    "/courses",
    "/blog",
    "/products",
    "/instructors",
  ];
  if (publicRoutes.includes(pathname)) {
    return { granted: true, redirectUrl: "" };
  }

  // Authentication required
  if (!token) {
    return {
      granted: false,
      redirectUrl: `/auth/signin?returnUrl=${encodeURIComponent(pathname)}`,
      reason: "authentication_required",
    };
  }

  // Role-based access control
  const userRole = token.role || "student";

  // Admin routes
  if (pathname.startsWith("/admin/")) {
    if (userRole !== "admin") {
      return {
        granted: false,
        redirectUrl: "/dashboard?error=admin_access_required",
        reason: "insufficient_privileges",
      };
    }
  }

  // Instructor routes
  // if (pathname.startsWith("/instructor/")) {
  //   if (!["instructor", "admin"].includes(userRole)) {
  //     return {
  //       granted: false,
  //       redirectUrl: "/dashboard?error=instructor_access_required",
  //       reason: "insufficient_privileges",
  //     };
  //   }
  // }

  // Student routes with enrollment checks
  if (pathname.startsWith("/learn/") || pathname.startsWith("/course/")) {
    const courseId = extractCourseId(pathname) || searchParams.get("courseId");
    if (courseId && !(await isUserEnrolled(token.id, courseId))) {
      return {
        granted: false,
        redirectUrl: "/dashboard?error=course_not_enrolled",
        reason: "course_access_denied",
      };
    }
  }

  // Time-based access control for exams
  if (pathname.includes("/exam/")) {
    const examAccess = await validateExamTimeAccess(token.id, pathname);
    if (!examAccess.valid) {
      return {
        granted: false,
        redirectUrl: `/dashboard?error=exam_${examAccess.reason}`,
        reason: "exam_access_restricted",
      };
    }
  }

  return { granted: true, redirectUrl: "" };
}

/**
 * Advanced Video Content Security
 */
async function enforceVideoSecurity(
  request: NextRequest,
  token: any,
  searchParams: URLSearchParams
): Promise<VideoSecurityResult> {
  const { pathname } = request.nextUrl;

  if (!token) {
    return { allowed: false, reason: "authentication_required" };
  }

  // Extract video and course information
  const videoId = extractVideoId(pathname);
  const courseId = extractCourseId(pathname) || searchParams.get("courseId");

  if (!videoId || !courseId) {
    return { allowed: false, reason: "invalid_video_reference" };
  }

  // 1. Course enrollment check
  if (!(await isUserEnrolled(token.id, courseId))) {
    return { allowed: false, reason: "course_not_enrolled" };
  }

  // 2. Video access permissions
  if (!(await hasVideoAccess(token.id, videoId, courseId))) {
    return { allowed: false, reason: "video_access_denied" };
  }

  // 3. Concurrent video stream limit
  const concurrentStreams = await getConcurrentVideoStreams(token.id);
  if (concurrentStreams >= SECURITY_CONFIG.LMS.MAX_CONCURRENT_VIDEOS) {
    return { allowed: false, reason: "concurrent_stream_limit" };
  }

  // 4. Geographic video restrictions
  const geoRestriction = await checkVideoGeoRestriction(videoId, request);
  if (!geoRestriction.allowed) {
    return { allowed: false, reason: "geo_restricted" };
  }

  // 5. Video token validation (for signed URLs)
  if (searchParams.has("token")) {
    const tokenValid = await validateVideoToken(
      searchParams.get("token") as string,
      videoId,
      token.id
    );
    if (!tokenValid) {
      return { allowed: false, reason: "invalid_video_token" };
    }
  }

  // 6. Download prevention
  if (isDownloadAttempt(request)) {
    return { allowed: false, reason: "download_attempt" };
  }

  // Track video access
  await trackVideoAccess(token.id, videoId, courseId, request);

  return { allowed: true, videoId, courseId };
}

/**
 * Exam & Assessment Security
 */
async function enforceExamSecurity(
  request: NextRequest,
  token: any,
  searchParams: URLSearchParams
): Promise<ExamSecurityResult> {
  const { pathname } = request.nextUrl;

  if (!token) {
    return { valid: false, reason: "authentication_required" };
  }

  const examId = extractExamId(pathname) || searchParams.get("examId");
  if (!examId) {
    return { valid: false, reason: "invalid_exam_reference" };
  }

  // 1. Exam enrollment and access period
  const examAccess = await validateExamAccess(token.id, examId);
  if (!examAccess.canAccess) {
    return { valid: false, reason: examAccess.reason as string };
  }

  // 2. Time window validation
  if (!(await isWithinExamWindow(examId))) {
    return { valid: false, reason: "exam_window_closed" };
  }

  // 3. Attempt limit check
  const attempts = await getExamAttempts(token.id, examId);
  if (attempts >= examAccess.maxAttempts) {
    return { valid: false, reason: "attempt_limit_exceeded" };
  }

  // 4. Anti-cheating measures
  const cheatingDetection = await detectCheatingBehavior(request, token.id, examId);
  if (cheatingDetection.suspicious) {
    await flagSuspiciousExamActivity(token.id, examId, cheatingDetection);
    return { valid: false, reason: "suspicious_activity" };
  }

  // 5. Secure browser requirements
  if (!hasSecureBrowser(request)) {
    return { valid: false, reason: "insecure_browser" };
  }

  return { valid: true, examId, attemptNumber: attempts + 1 };
}

// === SECURITY HEADERS IMPLEMENTATION ===

function addAdvancedSecurityHeaders(response: NextResponse, _request: NextRequest) {
  // Content Security Policy with LMS-specific directives
  const cspDirectives = [
    "default-src 'self' https://iframe.mediadelivery.net",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://assets.mediadelivery.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' http://localhost:5000 https://vitals.vercel-insights.com https://video.bunnycdn.com",
    "media-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // "block-all-mixed-content",
    // "upgrade-insecure-requests",
  ];

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // HSTS in production
  if (envConfig.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
}

function addVideoSecurityHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Accel-Expires", "0");
  response.headers.set("Accept-Ranges", "bytes");
  response.headers.set("X-Content-Duration", "true");
}

function addDocumentSecurityHeaders(response: NextResponse, security: any) {
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  response.headers.set("X-Content-Type-Options", "nosniff");

  if (security.watermark) {
    response.headers.set("X-Document-Watermark", security.watermark);
  }

  // Force download for sensitive documents
  if (security.forceDownload) {
    response.headers.set("Content-Disposition", `attachment; filename="${security.filename}"`);
  }
}

function addExamSecurityHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  response.headers.set("X-Exam-Secure", "true");
  response.headers.set("X-Frame-Options", "SAMEORIGIN"); // Allow same-origin for exam iframes
}

function addLMSSpecificHeaders(response: NextResponse, pathname: string) {
  // Add LMS-specific security headers
  response.headers.set("X-LMS-Security", "enabled");
  response.headers.set("X-Content-Protection", "active");

  if (pathname.includes("/video/") || pathname.includes("/document/")) {
    response.headers.set("X-Content-Owner", "protected");
  }
}

function addMonitoringHeaders(response: NextResponse, auditId: string) {
  response.headers.set("X-Security-Audit-ID", auditId);
  response.headers.set("X-Security-Level", "high");
}

// === HELPER FUNCTIONS ===

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  const forwardedIp = forwarded?.split(",")[0]?.trim() || "";

  return cfConnectingIP || forwardedIp || realIP || "unknown";
}

function blockResponse(request: NextRequest, message: string, status: number = 403): NextResponse {
  const clientIP = getClientIP(request);

  console.warn("SECURITY_BLOCK:", {
    timestamp: new Date().toISOString(),
    ip: clientIP,
    path: request.nextUrl.pathname,
    reason: message,
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
  });

  return new NextResponse(message, {
    status,
    headers: {
      "X-Blocked-Reason": message,
      "X-Blocked-By": "Security-Middleware",
    },
  });
}

async function handleThreatResponse(threatScan: any, request: NextRequest, auditId: string) {
  // Implement different responses based on threat level
  switch (threatScan.riskLevel) {
    case "critical":
      // Immediate block and ban
      await threatIntelligence.banIP(getClientIP(request), "critical_threat");
      break;
    case "high":
      // Block request
      break;
    case "medium":
      // Challenge request (could implement CAPTCHA)
      break;
    case "low":
      // Log only

      break;
  }
}

// === FUNCTIONAL IMPLEMENTATIONS ===

async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  try {
    // In production: const enrolled = await db.enrollments.findOne({ userId, courseId });
    // Mock implementation - replace with actual database check
    const mockEnrolledCourses = ["intro-to-cs", "advanced-js", "data-structures"];
    return mockEnrolledCourses.includes(courseId);
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return false; // Fail-safe: deny access on error
  }
}

async function hasVideoAccess(userId: string, videoId: string, courseId: string): Promise<boolean> {
  try {
    // First check enrollment
    const enrolled = await isUserEnrolled(userId, courseId);
    if (!enrolled) return false;

    // Additional video-specific check (e.g., prerequisites, unlock conditions)
    // In production: const videoAccess = await db.videoPermissions.findOne({ userId, videoId });
    const mockAccessibleVideos = ["vid1", "vid2", "vid3"];
    return mockAccessibleVideos.includes(videoId);
  } catch (error) {
    console.error("Error checking video access:", error);
    return false;
  }
}

async function checkConcurrentSessions(userId: string): Promise<number> {
  try {
    // In production: Query active sessions from Redis/database
    // Mock: Random number for demonstration, replace with real count
    return Math.floor(Math.random() * 4); // 0-3 sessions
  } catch (error) {
    console.error("Error checking concurrent sessions:", error);
    return 0; // Assume no concurrent sessions on error
  }
}

async function detectGeographicAnomaly(
  token: any,
  request: NextRequest
): Promise<{ detected: boolean; reason?: string }> {
  try {
    const currentIP = getClientIP(request);
    const lastIP = token.lastIP; // Assume token stores last known IP

    // Simple check: if IP changed and no recent login, flag anomaly
    // In production: Use GeoIP database to check country/city changes
    if (lastIP && lastIP !== currentIP && !token.recentLogin) {
      return { detected: true, reason: "IP address changed unexpectedly" };
    }
    return { detected: false };
  } catch (error) {
    console.error("Error detecting geographic anomaly:", error);
    return { detected: false };
  }
}

async function updateSessionActivity(token: any, request: NextRequest) {
  try {
    // In production: Update user session in database with current timestamp
    // Mock: Log activity
    // token.lastActivity = Date.now(); // Update token if using JWT
  } catch (error) {
    console.error("Error updating session activity:", error);
  }
}

async function validateExamAccess(
  userId: string,
  examId: string
): Promise<{ canAccess: boolean; reason?: string; maxAttempts: number }> {
  try {
    // Check enrollment in related course
    const courseId = examId.split("-")[0] as string; // Assume examId includes courseId
    const enrolled = await isUserEnrolled(userId, courseId);
    if (!enrolled) {
      return { canAccess: false, reason: "not_enrolled_in_course", maxAttempts: 0 };
    }

    // In production: Query exam settings from database
    return { canAccess: true, maxAttempts: 3 };
  } catch (error) {
    console.error("Error validating exam access:", error);
    return { canAccess: false, reason: "validation_error", maxAttempts: 0 };
  }
}

async function isWithinExamWindow(examId: string): Promise<boolean> {
  try {
    const now = new Date();
    // Mock exam windows - in production, query from database
    const examWindows: Record<string, { start: Date; end: Date }> = {
      exam1: { start: new Date("2023-01-01T10:00:00"), end: new Date("2023-01-01T12:00:00") },
      // Add more exams
    };

    const window = examWindows[examId];
    if (!window) return false; // Exam not scheduled

    return now >= window.start && now <= window.end;
  } catch (error) {
    console.error("Error checking exam window:", error);
    return false;
  }
}

async function getExamAttempts(userId: string, examId: string): Promise<number> {
  try {
    // In production: Query attempt history from database
    // Mock: Return random attempts
    return Math.floor(Math.random() * 3); // 0-2 attempts
  } catch (error) {
    console.error("Error getting exam attempts:", error);
    return 0;
  }
}

async function detectCheatingBehavior(
  request: NextRequest,
  userId: string,
  examId: string
): Promise<{ suspicious: boolean; indicators: string[] }> {
  try {
    const indicators: string[] = [];
    const userAgent = request.headers.get("user-agent") || "";

    // Check for suspicious user agents (e.g., automation tools)
    if (userAgent.includes("selenium") || userAgent.includes("puppeteer")) {
      indicators.push("automation_tool_detected");
    }

    // Check for rapid tab switching or copy-paste (basic heuristics)
    // In production: Track mouse/keyboard events via frontend
    if (request.headers.get("referer")?.includes("google.com")) {
      indicators.push("external_referer");
    }

    return { suspicious: indicators.length > 0, indicators };
  } catch (error) {
    console.error("Error detecting cheating:", error);
    return { suspicious: false, indicators: [] };
  }
}

function hasSecureBrowser(request: NextRequest): boolean {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const acceptLanguage = request.headers.get("accept-language") || "";

    // Check for modern browsers and required features
    const isModernBrowser = /Chrome|Firefox|Safari|Edge/.test(userAgent);
    const hasLanguage = acceptLanguage.length > 0;

    return isModernBrowser && hasLanguage;
  } catch (error) {
    console.error("Error checking secure browser:", error);
    return false;
  }
}

async function flagSuspiciousExamActivity(userId: string, examId: string, detection: any) {
  try {
    console.warn(
      `Suspicious exam activity flagged: User ${userId}, Exam ${examId}, Detection:`,
      detection
    );
    // In production: Store in database, send alert to admin
  } catch (error) {
    console.error("Error flagging suspicious activity:", error);
  }
}

async function checkVideoGeoRestriction(
  videoId: string,
  request: NextRequest
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const clientIP = getClientIP(request);
    // Mock: Restrict certain videos to specific regions
    // In production: Use GeoIP service or database
    const restrictedVideos = ["premium-vid1"];
    if (restrictedVideos.includes(videoId) && !clientIP.startsWith("192.168.")) {
      // Mock check
      return { allowed: false, reason: "geo_restricted" };
    }
    return { allowed: true };
  } catch (error) {
    console.error("Error checking video geo restriction:", error);
    return { allowed: false, reason: "check_failed" };
  }
}

async function validateVideoToken(
  token: string,
  videoId: string,
  userId: string
): Promise<boolean> {
  try {
    // In production: Verify JWT token with secret, check expiry, user match
    // Mock: Basic check
    return token.startsWith("vid_token_") && token.length > 20;
  } catch (error) {
    console.error("Error validating video token:", error);
    return false;
  }
}

function isDownloadAttempt(request: NextRequest): boolean {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const range = request.headers.get("range"); // Byte-range requests often indicate download
    const accept = request.headers.get("accept");

    const suspiciousUA =
      userAgent.includes("ffmpeg") ||
      userAgent.includes("youtube-dl") ||
      userAgent.includes("wget");
    const byteRange = range && range.includes("bytes=");
    const downloadHeaders = accept && accept.includes("application/octet-stream");

    return (suspiciousUA || byteRange || downloadHeaders) as boolean;
  } catch (error) {
    console.error("Error detecting download attempt:", error);
    return false;
  }
}

async function trackVideoAccess(
  userId: string,
  videoId: string,
  courseId: string,
  request: NextRequest
) {
  try {
    const clientIP = getClientIP(request);

    // In production: Store in analytics database
  } catch (error) {
    console.error("Error tracking video access:", error);
  }
}

function extractCourseId(pathname: string): string | null {
  const match = pathname.match(/\/(course|learn)\/([^\/]+)/);
  return match ? match[2] || null : null;
}

function extractVideoId(pathname: string): string | null {
  const match = pathname.match(/\/video\/([^\/]+)/);
  return match ? match[1] || null : null;
}

function extractExamId(pathname: string): string | null {
  const match = pathname.match(/\/(exam|assessment)\/([^\/]+)/);
  return match ? match[2] || null : null;
}

async function validateExamTimeAccess(
  userId: string,
  pathname: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const examId = extractExamId(pathname);
    if (!examId) return { valid: false, reason: "invalid_exam" };

    // Check if within general exam window
    const withinWindow = await isWithinExamWindow(examId);
    if (!withinWindow) return { valid: false, reason: "outside_exam_window" };

    // User-specific checks (e.g., individual scheduling)
    // In production: Query user's exam schedule from database
    const userSpecificAccess = true; // Mock: assume access

    return { valid: userSpecificAccess };
  } catch (error) {
    console.error("Error validating exam time access:", error);
    return { valid: false, reason: "validation_error" };
  }
}

async function getConcurrentVideoStreams(userId: string): Promise<number> {
  try {
    // In production: Query active video streams from cache/database
    // Mock: Return random count up to max allowed
    return Math.floor(Math.random() * SECURITY_CONFIG.LMS.MAX_CONCURRENT_VIDEOS);
  } catch (error) {
    console.error("Error getting concurrent video streams:", error);
    return 0;
  }
}

// === TYPE DEFINITIONS ===

interface SessionValidationResult {
  [x: string]: any;
  valid: boolean;
  anomalies: string[];
  riskLevel: "low" | "medium" | "high";
}

interface AccessControlResult {
  granted: boolean;
  redirectUrl: string;
  reason?: string;
}

interface VideoSecurityResult {
  allowed: boolean;
  reason?: string;
  videoId?: string;
  courseId?: string;
}

interface ExamSecurityResult {
  valid: boolean;
  reason?: string;
  examId?: string;
  attemptNumber?: number;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/auth).*)"],
};
