import { z } from "zod";
import { ALLOWED_PRIORITIES, ALLOWED_STATUSES } from "../config/constants.js";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  priority: z.enum(ALLOWED_PRIORITIES, {
    errorMap: () => ({ message: "Invalid task priority" }),
  }).optional(),
  status: z.enum(ALLOWED_STATUSES, {
    errorMap: () => ({ message: "Invalid task status" }),
  }).optional(),
  due_date: z.string().min(1, "Due date is required"),
  reminder_at: z.string().nullable().optional(),
  pinned: z.union([z.boolean(), z.number()]).optional(),
  favorite: z.union([z.boolean(), z.number()]).optional(),
  attachment_name: z.string().nullable().optional(),
});
