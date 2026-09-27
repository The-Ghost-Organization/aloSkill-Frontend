import { z } from "zod";

const personName = z
  .string()
  .trim()
  .min(2, "Please enter at least 2 characters")
  .max(60, "Name must not exceed 60 characters")
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u,
    "Please enter a valid name"
  );

export const contactFormSchema = z.object({
  firstName: personName,
  lastName: personName,
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(120, "Email must not exceed 120 characters")
    .toLowerCase(),
  subject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters")
    .max(160, "Subject must not exceed 160 characters"),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(3000, "Message must not exceed 3000 characters"),
  // Honeypot. Real users never see or fill this field.
  website: z.string().max(200).optional().default(""),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
