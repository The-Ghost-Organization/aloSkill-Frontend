import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default(process.env.NODE_ENV),
  BACKEND_API_URL: z
    .url({ message: "Invalid HTTP(S) URL" })
    .default(process.env["BACKEND_API_URL"] as string),
  NEXTAUTH_URL: z
    .url({ message: "Invalid HTTP(S) URL" })
    .default(process.env.NEXTAUTH_URL as string),
  NEXTAUTH_SECRET: z
    .string({ message: "NEXTAUTH_SECRET is required" })
    .min(32, { message: "NEXTAUTH_SECRET must be at least 32 character long" })
    .default(process.env.NEXTAUTH_SECRET as string),
  GOOGLE_CLIENT_ID: z.string().min(1, { message: "Google Client ID is Required" }),
  // .default(process.env["GOOGLE_CLIENT_ID"] as string),
  GOOGLE_CLIENT_SECRET: z.string().min(1, { message: "Google Client Secret is Required" }),
  // .default(process.env["GOOGLE_CLIENT_SECRET"] as string),
});

export const config = envSchema.parse(process.env);

export type Config = z.infer<typeof envSchema>;
