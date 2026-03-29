const ApprovalRequest = require("../models/ApprovalRequest");
const Expense = require("../models/Expense");

exports.getPendingApprovals = async (req, res) => {
  const approvals = await ApprovalRequest.findAll({
    where: {
      approver_id: req.user.id,
      status: "pending"
    }
  });

  res.json(approvals);
};

exports.approveExpense = async (req, res) => {
  const approval = await ApprovalRequest.findByPk(req.params.id);

  approval.status = "approved";
  approval.comment = req.body.comment;

  await approval.save();

  await Expense.update(
    { status: "approved" },
    {
      where: { id: approval.expense_id }
    }
  );

  res.json({
    message: "Expense approved"
  });
};

exports.rejectExpense = async (req, res) => {
  const approval = await ApprovalRequest.findByPk(req.params.id);

  approval.status = "rejected";
  approval.comment = req.body.comment;

  await approval.save();

  await Expense.update(
    { status: "rejected" },
    {
      where: { id: approval.expense_id }
    }
  );

  res.json({
    message: "Expense rejected"
  });
};