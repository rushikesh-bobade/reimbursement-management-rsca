import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReimburseFlow — Expense Management",
  description: "Enterprise-grade reimbursement management system with multi-level approval workflows, real-time currency conversion, and comprehensive expense tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
