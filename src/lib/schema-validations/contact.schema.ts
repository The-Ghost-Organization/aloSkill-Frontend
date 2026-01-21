import { z } from "zod";

export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),
  
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),
  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must not exceed 100 characters")
    .toLowerCase()
    .trim(),
  
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must not exceed 200 characters")
    .trim(),
  
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must not exceed 2000 characters")
    .trim(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;