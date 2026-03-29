// Approval Engine — State Machine with Conditional Logic
// Handles: PERCENTAGE, SPECIFIC_ROLE, HYBRID rule types
// Sequential flow: expense moves to next step only after current step is resolved

import prisma from "@/lib/prisma";

interface ApprovalResult {
  success: boolean;
  message: string;
  newStatus?: string;
  nextStep?: number;
}

/**
 * Process an approval/rejection action for an expense
 */
export async function processApprovalAction(
  expenseId: string,
  approverId: string,
  action: "APPROVED" | "REJECTED",
  comment?: string
): Promise<ApprovalResult> {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      approvalQueue: {
        include: { approvalRule: true, approver: true },
      },
    },
  });

  if (!expense) {
    return { success: false, message: "Expense not found" };
  }

  if (expense.status === "APPROVED" || expense.status === "REJECTED") {
    return { success: false, message: "Expense has already been finalized" };
  }

  // Get current step's approval rule
  const currentRule = await prisma.approvalRule.findFirst({
    where: {
      companyId: (await prisma.user.findUnique({ where: { id: expense.submitterId } }))?.companyId,
      stepOrder: expense.currentStepOrder,
      isActive: true,
    },
  });

  if (!currentRule) {
    return { success: false, message: "No approval rule found for current step" };
  }

  // Record the approver's action
  await prisma.expenseApprovalQueue.upsert({
    where: {
      expenseId_approvalRuleId_approverId: {
        expenseId,
        approvalRuleId: currentRule.id,
        approverId,
      },
    },
    update: {
      action,
      comment,
      actionAt: new Date(),
    },
    create: {
      expenseId,
      approvalRuleId: currentRule.id,
      approverId,
      action,
      comment,
      actionAt: new Date(),
    },
  });

  // If rejected, immediately reject the expense
  if (action === "REJECTED") {
    await prisma.expense.update({
      where: { id: expenseId },
      data: { status: "REJECTED" },
    });
    return { success: true, message: "Expense rejected", newStatus: "REJECTED" };
  }

  // Evaluate if the current step is satisfied
  const stepSatisfied = await evaluateStepCondition(expenseId, currentRule.id, currentRule);

  if (stepSatisfied) {
    // Check if there's a next step
    const nextRule = await prisma.approvalRule.findFirst({
      where: {
        companyId: currentRule.companyId,
        stepOrder: { gt: currentRule.stepOrder },
        isActive: true,
      },
      orderBy: { stepOrder: "asc" },
    });

    if (nextRule) {
      // Move to next step
      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          currentStepOrder: nextRule.stepOrder,
          status: "IN_REVIEW",
        },
      });
      return {
        success: true,
        message: `Step ${currentRule.stepOrder} approved. Moving to step ${nextRule.stepOrder}: ${nextRule.ruleName}`,
        newStatus: "IN_REVIEW",
        nextStep: nextRule.stepOrder,
      };
    } else {
      // Final step — approve the expense
      await prisma.expense.update({
        where: { id: expenseId },
        data: { status: "APPROVED" },
      });
      return { success: true, message: "Expense fully approved!", newStatus: "APPROVED" };
    }
  }

  return {
    success: true,
    message: "Vote recorded. Waiting for more approvals at this step.",
    newStatus: expense.status,
  };
}

/**
 * Evaluate whether the conditions for a given approval step are satisfied
 */
async function evaluateStepCondition(
  expenseId: string,
  ruleId: string,
  rule: {
    ruleType: string;
    percentageRequired: number | null;
    specificRoleName: string | null;
    approverRole: string;
  }
): Promise<boolean> {
  // Get all queue items for this expense + rule
  const queueItems = await prisma.expenseApprovalQueue.findMany({
    where: { expenseId, approvalRuleId: ruleId },
    include: { approver: true },
  });

  const approvedItems = queueItems.filter((q) => q.action === "APPROVED");

  // Count total eligible approvers for this rule's role
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { submitter: true },
  });
  if (!expense) return false;

  const eligibleApprovers = await prisma.user.count({
    where: {
      companyId: expense.submitter.companyId,
      role: rule.approverRole as "ADMIN" | "MANAGER" | "EMPLOYEE",
      id: { not: expense.submitterId }, // submitter can't approve own expense
    },
  });

  switch (rule.ruleType) {
    case "PERCENTAGE": {
      if (!rule.percentageRequired || eligibleApprovers === 0) return false;
      const approvalRate = approvedItems.length / eligibleApprovers;
      return approvalRate >= rule.percentageRequired;
    }

    case "SPECIFIC_ROLE": {
      if (!rule.specificRoleName) return false;
      // Check if the specific person (e.g., "CFO") has approved
      return approvedItems.some(
        (q) => q.approver?.department === rule.specificRoleName ||
               q.approver?.name === rule.specificRoleName
      );
    }

    case "HYBRID": {
      // EITHER percentage threshold met OR specific role approved
      const percentageMet =
        rule.percentageRequired &&
        eligibleApprovers > 0 &&
        approvedItems.length / eligibleApprovers >= rule.percentageRequired;

      const specificApproved =
        rule.specificRoleName &&
        approvedItems.some(
          (q) => q.approver?.department === rule.specificRoleName ||
                 q.approver?.name === rule.specificRoleName
        );

      return Boolean(percentageMet || specificApproved);
    }

    default:
      return false;
  }
}

/**
 * Initialize approval queue entries for a new expense
 */
export async function initializeApprovalQueue(expenseId: string, companyId: string): Promise<void> {
  const firstRule = await prisma.approvalRule.findFirst({
    where: { companyId, isActive: true },
    orderBy: { stepOrder: "asc" },
  });

  if (!firstRule) {
    // No approval rules — auto-approve
    await prisma.expense.update({
      where: { id: expenseId },
      data: { status: "APPROVED", currentStepOrder: 1 },
    });
    return;
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: { status: "PENDING", currentStepOrder: firstRule.stepOrder },
  });
}
