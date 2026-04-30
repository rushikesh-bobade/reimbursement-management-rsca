import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),
  index("routes/home.tsx"),
  route("/submit-expense", "routes/submit-expense.tsx"),
  route("/approvals", "routes/pending-approvals.tsx"),
  route("/admin/users", "routes/user-management.tsx"),
  route("/admin/rules", "routes/approval-rules.tsx"),
] satisfies RouteConfig;
