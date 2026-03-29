const { z } = require("zod");

const expenseSchema = z.object({
  original_amount: z.number(),
  original_currency: z.string(),
  converted_amount: z.number(),
  category_id: z.number(),
  description: z.string(),
  expense_date: z.string()
});

module.exports = expenseSchema;