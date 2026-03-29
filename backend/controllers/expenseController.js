const Expense = require("../models/Expense");
const expenseSchema = require("../validators/expenseSchema");

exports.createExpense = async (req, res) => {
  try {
    const parsed = expenseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors
      });
    }

    const expense = await Expense.create({
      ...req.body,
      employee_id: req.user.id
    });

    res.status(201).json({
      message: "Expense submitted",
      expense
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.getMyExpenses = async (req, res) => {
  const expenses = await Expense.findAll({
    where: {
      employee_id: req.user.id
    }
  });

  res.json(expenses);
};