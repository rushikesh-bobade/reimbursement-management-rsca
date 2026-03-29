import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(2, "Company Name is required"),
  baseCurrency: z.string().length(3, "Currency code must be 3 characters"),
});

// ─── USER SCHEMAS ───────────────────────────────────

export const createUserSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"], {
    required_error: "Role is required",
  }),
  department: z.string().optional(),
  managerId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ─── EXPENSE SCHEMAS ────────────────────────────────

export const expenseFormSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(10000000, "Amount cannot exceed 10,000,000"),
  originalCurrency: z
    .string({ required_error: "Currency is required" })
    .length(3, "Currency code must be exactly 3 characters"),
  category: z.enum(
    ["TRAVEL", "MEALS", "OFFICE_SUPPLIES", "EQUIPMENT", "SOFTWARE", "COMMUNICATION", "OTHER"],
    { required_error: "Category is required" }
  ),
  description: z
    .string({ required_error: "Description is required" })
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description cannot exceed 500 characters"),
  date: z
    .string({ required_error: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
  receiptUrl: z.string().optional(),
});

export type ExpenseFormInput = z.infer<typeof expenseFormSchema>;

// ─── APPROVAL RULE SCHEMAS ──────────────────────────

export const approvalRuleSchema = z.object({
  stepOrder: z
    .number({ required_error: "Step order is required" })
    .int("Step order must be a whole number")
    .positive("Step order must be positive"),
  ruleName: z
    .string({ required_error: "Rule name is required" })
    .min(2, "Rule name must be at least 2 characters")
    .max(100, "Rule name cannot exceed 100 characters"),
  ruleType: z.enum(["PERCENTAGE", "SPECIFIC_ROLE", "HYBRID"], {
    required_error: "Rule type is required",
  }),
  approverRole: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"], {
    required_error: "Approver role is required",
  }),
  specificRoleName: z.string().optional(),
  percentageRequired: z
    .number()
    .min(0, "Percentage must be between 0 and 1")
    .max(1, "Percentage must be between 0 and 1")
    .optional(),
}).refine(
  (data) => {
    if (data.ruleType === "PERCENTAGE" || data.ruleType === "HYBRID") {
      return data.percentageRequired !== undefined && data.percentageRequired > 0;
    }
    return true;
  },
  { message: "Percentage is required for PERCENTAGE and HYBRID rule types", path: ["percentageRequired"] }
).refine(
  (data) => {
    if (data.ruleType === "SPECIFIC_ROLE" || data.ruleType === "HYBRID") {
      return data.specificRoleName !== undefined && data.specificRoleName.length > 0;
    }
    return true;
  },
  { message: "Specific role name is required for SPECIFIC_ROLE and HYBRID types", path: ["specificRoleName"] }
);

export type ApprovalRuleInput = z.infer<typeof approvalRuleSchema>;

// ─── APPROVAL ACTION SCHEMA ────────────────────────

export const approvalActionSchema = z.object({
  expenseId: z.string({ required_error: "Expense ID is required" }),
  action: z.enum(["APPROVED", "REJECTED"], {
    required_error: "Action is required",
  }),
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional(),
});

export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;

// ─── COMPANY SCHEMA ────────────────────────────────

export const companySchema = z.object({
  name: z
    .string({ required_error: "Company name is required" })
    .min(2, "Company name must be at least 2 characters"),
  baseCurrency: z
    .string({ required_error: "Base currency is required" })
    .length(3, "Currency code must be exactly 3 characters"),
});

export type CompanyInput = z.infer<typeof companySchema>;
