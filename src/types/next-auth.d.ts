import "next-auth";
import "next-auth/jwt";

export enum UserRole {
  STUDENT = "STUDENT",
  INSTRUCTOR = "INSTRUCTOR",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole[];
      status?: UserStatus;
      isEmailVerified?: boolean;
      profilePicture?: string | null;
      name?: string | null;
      image?: string | null;
      provider?: string;
    };
    accessToken: string | null;
    accessTokenExpires?: number | undefined;
    error?: string | null;
  }

  interface User {
    id: string;
    email: string;
    role: UserRole[];
    profilePicture?: string;
    accessToken: string;
    refreshToken: string;
    displayName?: string;
  }

  interface JWT {
    id?: string;
    role?: UserRole[];
    profilePicture?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    accessTokenExpires?: number;
    error?: string | null;
  }
}
