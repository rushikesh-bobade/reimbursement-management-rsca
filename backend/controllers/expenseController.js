const Expense = require("../models/Expense");
const User = require("../models/user");
const ApprovalRequest = require("../models/ApprovalRequest");
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

    const employee = await User.findByPk(req.user.id);

    if (employee.manager_id) {
      await ApprovalRequest.create({
        expense_id: expense.id,
        approver_id: employee.manager_id,
        step_order: 1
      });
    }

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
  try {
    const expenses = await Expense.findAll({
      where: {
        employee_id: req.user.id
      }
    });

    res.json(expenses);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};