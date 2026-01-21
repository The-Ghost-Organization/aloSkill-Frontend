
import type { NextRequest } from "next/server";

export class ContentValidator {
  async validateContentAccess(request: NextRequest, token: any): Promise<ContentAccessResult> {
    const { pathname, searchParams } = request.nextUrl;

    // Course content access
    if (pathname.startsWith("/learn/") || pathname.startsWith("/course/")) {
      return this.validateCourseAccess(request, token);
    }

    // Video content access
    if (pathname.includes("/video/")) {
      return this.validateVideoAccess(request, token);
    }

    // Document access
    if (pathname.includes("/document/") || pathname.includes("/pdf/")) {
      return this.validateDocumentAccess(request, token);
    }

    // Exam access
    if (pathname.includes("/exam/") || pathname.includes("/assessment/")) {
      return this.validateExamAccess(request, token);
    }

    return { granted: true };
  }

  private async validateCourseAccess(
    request: NextRequest,
    token: any
  ): Promise<ContentAccessResult> {
    if (!token) {
      return { granted: false, reason: "authentication_required" };
    }

    const courseId =
      this.extractCourseId(request.nextUrl.pathname) ||
      request.nextUrl.searchParams.get("courseId");

    if (!courseId) {
      return { granted: false, reason: "invalid_course_reference" };
    }

    // Check course enrollment
    const isEnrolled = await this.checkCourseEnrollment(token.id, courseId);
    if (!isEnrolled) {
      return { granted: false, reason: "course_not_enrolled" };
    }

    // Check course status
    const courseStatus = await this.getCourseStatus(courseId);
    if (courseStatus !== "published") {
      return { granted: false, reason: "course_not_available" };
    }

    // Check subscription status if applicable
    const hasValidSubscription = await this.checkSubscription(token.id, courseId);
    if (!hasValidSubscription) {
      return { granted: false, reason: "subscription_required" };
    }

    return { granted: true, courseId };
  }

  private async validateVideoAccess(
    request: NextRequest,
    token: any
  ): Promise<ContentAccessResult> {
    if (!token) {
      return { granted: false, reason: "authentication_required" };
    }

    const videoId = this.extractVideoId(request.nextUrl.pathname);
    const courseId =
      this.extractCourseId(request.nextUrl.pathname) ||
      request.nextUrl.searchParams.get("courseId");

    if (!videoId || !courseId) {
      return { granted: false, reason: "invalid_video_reference" };
    }

    // Verify video belongs to course
    const videoCourse = await this.getVideoCourse(videoId);
    if (videoCourse !== courseId) {
      return { granted: false, reason: "video_course_mismatch" };
    }

    // Check video access permissions
    const canAccessVideo = await this.checkVideoAccess(token.id, videoId, courseId);
    if (!canAccessVideo) {
      return { granted: false, reason: "video_access_denied" };
    }

    // Check concurrent stream limit
    const concurrentStreams = await this.getConcurrentStreams(token.id);
    if (concurrentStreams >= 3) {
      return { granted: false, reason: "concurrent_stream_limit" };
    }

    return { granted: true, videoId, courseId };
  }

  private async validateDocumentAccess(
    request: NextRequest,
    token: any
  ): Promise<ContentAccessResult> {
    if (!token) {
      return { granted: false, reason: "authentication_required" };
    }

    const documentId = this.extractDocumentId(request.nextUrl.pathname);
    const courseId =
      this.extractCourseId(request.nextUrl.pathname) ||
      request.nextUrl.searchParams.get("courseId");

    if (!documentId || !courseId) {
      return { granted: false, reason: "invalid_document_reference" };
    }

    // Check document access
    const canAccessDocument = await this.checkDocumentAccess(token.id, documentId, courseId);
    if (!canAccessDocument) {
      return { granted: false, reason: "document_access_denied" };
    }

    // Check download permissions
    const canDownload = await this.checkDownloadPermission(token.id, documentId);

    return {
      granted: true,
      documentId,
      courseId,
      metadata: { canDownload },
    };
  }

  private async validateExamAccess(request: NextRequest, token: any): Promise<ContentAccessResult> {
    if (!token) {
      return { granted: false, reason: "authentication_required" };
    }

    const examId =
      this.extractExamId(request.nextUrl.pathname) || request.nextUrl.searchParams.get("examId");

    if (!examId) {
      return { granted: false, reason: "invalid_exam_reference" };
    }

    // Check exam enrollment
    const examAccess = await this.getExamAccess(token.id, examId);
    if (!examAccess.canAccess) {
      return { granted: false, reason: examAccess.reason as string };
    }

    // Check exam time window
    const inTimeWindow = await this.isWithinExamWindow(examId);
    if (!inTimeWindow) {
      return { granted: false, reason: "exam_window_closed" };
    }

    // Check attempt limit
    const attempts = await this.getExamAttempts(token.id, examId);
    if (attempts >= examAccess.maxAttempts) {
      return { granted: false, reason: "attempt_limit_exceeded" };
    }

    return { granted: true, examId, attemptNumber: attempts + 1 };
  }

  // Helper methods (implement with your actual data logic)
  private async checkCourseEnrollment(userId: string, courseId: string): Promise<boolean> {
    // Implement with your database logic
    return true;
  }

  private async getCourseStatus(courseId: string): Promise<string> {
    // Implement with your database logic
    return "published";
  }

  private async checkSubscription(userId: string, courseId: string): Promise<boolean> {
    // Implement subscription check
    return true;
  }

  private async getVideoCourse(videoId: string): Promise<string> {
    // Implement video-course relationship check
    return "course-id";
  }

  private async checkVideoAccess(
    userId: string,
    videoId: string,
    courseId: string
  ): Promise<boolean> {
    // Implement video access check
    return true;
  }

  private async getConcurrentStreams(userId: string): Promise<number> {
    // Implement concurrent stream tracking
    return 0;
  }

  private async checkDocumentAccess(
    userId: string,
    documentId: string,
    courseId: string
  ): Promise<boolean> {
    // Implement document access check
    return true;
  }

  private async checkDownloadPermission(userId: string, documentId: string): Promise<boolean> {
    // Implement download permission check
    return false; // Default to no download
  }

  private async getExamAccess(
    userId: string,
    examId: string
  ): Promise<{ canAccess: boolean; reason?: string; maxAttempts: number }> {
    // Implement exam access check
    return { canAccess: true, maxAttempts: 3 };
  }

  private async isWithinExamWindow(examId: string): Promise<boolean> {
    // Implement exam time window check
    return true;
  }

  private async getExamAttempts(userId: string, examId: string): Promise<number> {
    // Implement exam attempts tracking
    return 0;
  }

  private extractCourseId(pathname: string): string | null {
    const match = pathname.match(/\/(course|learn)\/([^\/]+)/);
    return match ? (match[2] as string) : null;
  }

  private extractVideoId(pathname: string): string | null {
    const match = pathname.match(/\/video\/([^\/]+)/);
    return match ? (match[1] as string) : null;
  }

  private extractDocumentId(pathname: string): string | null {
    const match = pathname.match(/\/(document|pdf)\/([^\/]+)/);
    return match ? (match[2] as string) : null;
  }

  private extractExamId(pathname: string): string | null {
    const match = pathname.match(/\/(exam|assessment)\/([^\/]+)/);
    return match ? (match[2] as string) : null;
  }
}

export interface ContentAccessResult {
  granted: boolean;
  reason?: string;
  courseId?: string;
  videoId?: string;
  documentId?: string;
  examId?: string;
  attemptNumber?: number;
  metadata?: any;
}

export const contentValidator = new ContentValidator();
