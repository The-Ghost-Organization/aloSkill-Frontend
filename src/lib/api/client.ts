import { config } from "../../config/env";

const API_BASE_URL = config.NEXT_PUBLIC_BACKEND_API_URL.replace(/\/+$/, "");

export const API_ENDPOINTS = {
  FINANCE: { ADMIN: "/finance/admin", INSTRUCTOR: "/finance/instructor" },
  COURSE: {
    INSTRUCTOR_DASHBOARD: "/course/instructorDashboard",
    INSTRUCTOR_EARNINGS: "/course/instructor/earnings",
    PUBLIC_TESTIMONIALS: "/course/public/testimonials",
    REVIEWS: (courseId: string) => `/course/public/viewCourse/${courseId}/reviews`,
    REVIEW_STATUS: (courseId: string) => `/course/user/${courseId}/review-status`,
    SUBMIT_REVIEW: (courseId: string) => `/course/user/${courseId}/reviews`,
  },
  STUDENT: {
    DASHBOARD: "/user/student/me/dashboard",
    INSTRUCTORS: "/user/student/me/instructors",
  },
  CONTACT: {
    SUBMIT: "/contact",
  },
} as const;

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown[];
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const headers = new Headers(options.headers);

      if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      // Client components can obtain the token automatically.
      // Server components/actions should pass Authorization explicitly from getServerSession().
      if (!headers.has("Authorization") && typeof window !== "undefined") {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        if (session?.accessToken) {
          headers.set("Authorization", `Bearer ${session.accessToken}`);
        }
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? ((await response.json()) as ApiResponse<T>)
        : null;

      if (!response.ok) {
        return {
          success: false,
          message: payload?.message || `Request failed with status ${response.status}.`,
          errors: payload?.errors,
        };
      }

      return (
        payload || {
          success: false,
          message: "Backend returned an invalid response.",
        }
      );
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  }

  async get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
      headers: customHeaders || {},
    });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: customHeaders || {},
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const headers = new Headers();

      if (typeof window !== "undefined") {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        if (session?.accessToken) {
          headers.set("Authorization", `Bearer ${session.accessToken}`);
        }
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        body: formData,
        headers,
      });
      const data = (await response.json()) as ApiResponse<T>;
      return data;
    } catch (error) {
      console.error(`Form-data API request failed: ${endpoint}`, error);
      return { success: false, message: "Network error." };
    }
  }

  // Authenticate once per source-file upload, rather than fetching a NextAuth
  // session for every chunk. XHR exposes real upload progress unlike fetch.
  async createFormUploader() {
    const headers = new Headers();
    if (typeof window !== 'undefined') {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);
    }
    return <T>(endpoint: string, formData: FormData, onProgress: (fraction: number) => void): Promise<ApiResponse<T>> =>
      new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open('POST', `${this.baseURL}${endpoint}`);
        request.timeout = 300_000;
        headers.forEach((value, key) => request.setRequestHeader(key, value));
        request.upload.onprogress = event => {
          if (event.lengthComputable && event.total > 0) onProgress(Math.min(1, event.loaded / event.total));
        };
        request.onload = () => {
          try {
            const response = JSON.parse(request.responseText) as ApiResponse<T>;
            resolve(request.status >= 200 && request.status < 300 ? response : { ...response, success: false });
          } catch { resolve({ success: false, message: `Upload request failed (HTTP ${request.status}).` }); }
        };
        request.onerror = () => resolve({ success: false, message: 'Upload connection interrupted. Retrying this chunk…' });
        request.ontimeout = () => resolve({ success: false, message: 'Upload chunk timed out. Retrying…' });
        request.onabort = () => resolve({ success: false, message: 'Upload cancelled.' });
        request.send(formData);
      });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: customHeaders || {},
    });
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_BASE_URL };
