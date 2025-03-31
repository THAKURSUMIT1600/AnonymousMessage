import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 Characters" })
    .max(300, { message: "Content Must be No Longer than 300 Characters" }),
});
