import { NextRequest, NextResponse } from "next/server";
import { approvalActionSchema } from "@/lib/schemas";
import { processApprovalAction } from "@/lib/approval-engine";

// POST /api/approvals — process an approval/rejection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = approvalActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const approverId = request.headers.get("x-user-id");
    if (!approverId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const { expenseId, action, comment } = parsed.data;

    const result = await processApprovalAction(expenseId, approverId, action, comment);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/approvals error:", error);
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}
