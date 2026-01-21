import type { UserRole, UserStatus } from "@/types/next-auth.js";
import { apiClient } from "./client";

// === INTERFACES ===
export interface RegisterPayload {
  displayName: string;
  email: string;
  gender: "MALE" | "FEMALE";
  password?: string;
  phoneNumber?: string;
  bio?: string | undefined;
  googleId?: string;
  avatarUrl?: string | null;
}

export interface LoginPayload {
  email: string;
  password?: string;
  googleId?: string;
}

export interface UserData {
  id: string;
  email: string;
  displayName: string;
  role: UserRole[];
  status: UserStatus;
  isEmailVerified: boolean;
  profilePicture?: string | null;
  accessToken: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  displayName: string;
  role: UserRole[];
  status: UserStatus;
  isEmailVerified: boolean;
  profilePicture?: string | null;
  accessToken: string;
  refreshToken: string;
}

export interface InstructorResponse {
  id: string;
  email: string;
  status: UserStatus;
  role: string[];
  displayName: string | undefined;
  profilePicture: string | null;
  redirectToVerificationPage: boolean;
}

export interface VerifyEmailPayload {
  id: string;
  token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  id: string;
  token: string;
  password: string;
  confirmPassword: string;
  // newPassword: string;
}

// === AUTH SERVICE ===
export const authService = {
  // Current user data (cached in memory)
  currentUser: null as UserData | null,

  // Register new user
  async register(payload: RegisterPayload) {
    const response = await apiClient.post<AuthResponse>("/auth/register", payload);

    if (response.success && response.data) {
      // Store user data in memory
      this.currentUser = response.data;
    }

    return response;
  },

  // Login user
  async login(payload: LoginPayload) {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);

    if (response.success && response.data) {
      this.currentUser = response.data;
    }

    return response;
  },

  // Google OAuth login
  async googleAuth(payload: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }) {
    const response = await apiClient.post<AuthResponse>("/auth/google", payload);

    if (response.success && response.data) {
      this.currentUser = response.data;
    }

    return response;
  },

  // === Logout from current device ===
  async logoutCurrentDevice(refreshToken?: string) {
    const headers: Record<string, string> = {};

    if (refreshToken) {
      headers["Authorization"] = `Bearer ${refreshToken}`;
    }

    return apiClient.post("/auth/logout", undefined, headers);
  },

  // === Logout from all devices ===
  async logoutAllDevices(refreshToken?: string) {
    const headers: Record<string, string> = {};

    if (refreshToken) {
      headers["Authorization"] = `Bearer ${refreshToken}`;
    }
    return apiClient.post("/auth/logout-all", undefined, headers);
  },

  // Refresh access token (automatic via cookies)
  async refreshToken(token: string) {
    const response = await apiClient.post<AuthResponse>(
      "/auth/refresh",
      {},
      { Authorization: `Bearer ${token}` }
    );
    if (response.success && response.data) {
      this.currentUser = response.data;
    }

    return response;
  },

  // Verify email
  async verifyEmail(payload: VerifyEmailPayload) {
    return await apiClient.post("/auth/verify", payload);
  },

  // Forgot password
  async forgotPassword(payload: ForgotPasswordPayload) {
    return await apiClient.post("/auth/forgot-password", payload);
  },

  // Reset password
  async resetPassword(payload: ResetPasswordPayload) {
    return await apiClient.post(`/auth/reset-password?id=${payload.id}&token=${payload.token}`, {
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    });
  },

  // Get current user (from cache or fetch from backend)
  async getCurrentUser(): Promise<UserData | null> {
    // Return cached user if available
    if (this.currentUser) {
      return this.currentUser;
    }

    // Fetch from backend using cookie authentication
    try {
      const response = await apiClient.get<AuthResponse>("/auth/me");

      if (response.success && response.data) {
        this.currentUser = response.data;
        return this.currentUser;
      }
    } catch (_error) {
      // console.error("Failed to fetch current user:", error);
    }

    return null;
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    // Try to get current user
    const user = await this.getCurrentUser();
    return user !== null;
  },

  // Clear cached user data (call this on app load if needed)
  clearCache() {
    this.currentUser = null;
  },
};
