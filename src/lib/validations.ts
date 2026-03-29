import { z } from "zod";

export const expenseFormSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(1000000, "Amount cannot exceed 1,000,000"),
  currency: z
    .string({ required_error: "Currency is required" })
    .min(3, "Currency code must be 3 characters")
    .max(3, "Currency code must be 3 characters"),
  category: z.enum(["TRAVEL", "MEALS", "OFFICE_SUPPLIES", "EQUIPMENT", "SOFTWARE", "OTHER"], {
    required_error: "Category is required",
  }),
  description: z
    .string({ required_error: "Description is required" })
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description cannot exceed 500 characters"),
  date: z
    .string({ required_error: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
  receiptUrl: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export const approvalRuleSchema = z.object({
  level: z
    .number({ required_error: "Level is required" })
    .int("Level must be a whole number")
    .positive("Level must be positive"),
  roleName: z
    .string({ required_error: "Role name is required" })
    .min(2, "Role name must be at least 2 characters"),
  roleType: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"], {
    required_error: "Role type is required",
  }),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

export type ApprovalRuleFormData = z.infer<typeof approvalRuleSchema>;

export const approvalActionSchema = z.object({
  expenseId: z.string(),
  action: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().optional(),
});

export type ApprovalActionData = z.infer<typeof approvalActionSchema>;
