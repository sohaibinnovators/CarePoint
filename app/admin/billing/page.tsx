"use client";

import { BillingWorkspace } from "@/components/billing/billing-workspace";

export default function AdminBillingPage() {
  return (
    <BillingWorkspace
      title="Billing & Invoices"
      description="Demo financial records calculated from local invoices and payments."
      showExpenseLink
    />
  );
}
