import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(4, "Username must be atleast 4 Characters")
  .max(20, "Username must be no more than 20 Characters")
  .regex(/^[a-zA-Z0-9._-]+$/, "Username Must not Contain Special Character");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid Email Address" }),
  password: z
    .string()
    .min(6, { message: "Password must be Atleast 6 Character" }),
});
