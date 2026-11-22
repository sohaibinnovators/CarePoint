"use client";

import { useMemo, useState } from "react";
import { InvoicePrintView } from "@/components/billing/invoice-print";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import {
  DEMO_BILLING_NOTICE,
  formatMoney,
  invoiceStatusLabel,
  paymentMethodLabel,
} from "@/lib/billing";
import type { Invoice } from "@/lib/types";
import { CreditCard, DollarSign, Wallet } from "lucide-react";

const PATIENT_ID = "pt-1001";

export default function PatientBillingPage() {
  const { ready, patients, invoices, payments } = useCarePointStore();
  const [selected, setSelected] = useState<Invoice | null>(null);

  const patient = patients.find((item) => item.id === PATIENT_ID);
  const mine = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.patientId === PATIENT_ID)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [invoices],
  );
  const myPayments = useMemo(
    () =>
      payments
        .filter((payment) => payment.patientId === PATIENT_ID)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [payments],
  );
  const outstanding = mine
    .filter((invoice) => invoice.status !== "cancelled" && invoice.status !== "draft")
    .reduce((sum, invoice) => sum + invoice.balanceDue, 0);
  const paidTotal = myPayments.reduce((sum, payment) => sum + payment.amount, 0);

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bills & Invoices"
        description={`Demo billing for ${patient?.name || "your profile"} only.`}
      />
      <p className="text-xs text-muted">{DEMO_BILLING_NOTICE}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Invoices"
          value={mine.length}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          title="Outstanding"
          value={formatMoney(outstanding)}
          tone="amber"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          title="Payments recorded"
          value={formatMoney(paidTotal)}
          tone="emerald"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader title="Your invoices" />
        <CardBody className="p-0">
          {mine.length === 0 ? (
            <EmptyState
              title="No invoices on file"
              description="Demo invoices for your patient profile will appear here."
            />
          ) : (
            <Table headers={["Invoice", "Date", "Total", "Balance", "Status", ""]}>
              {mine.map((invoice) => (
                <tr key={invoice.id}>
                  <Td className="font-medium">{invoice.id}</Td>
                  <Td>{invoice.date}</Td>
                  <Td>{formatMoney(invoice.total)}</Td>
                  <Td>{formatMoney(invoice.balanceDue)}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(invoice.status)}>
                      {invoiceStatusLabel(invoice.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(invoice)}
                    >
                      View
                    </Button>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Payment history" />
        <CardBody className="space-y-3">
          {myPayments.length === 0 ? (
            <p className="text-sm text-muted">No payments recorded for your profile.</p>
          ) : (
            myPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>
                  {payment.date} · {payment.invoiceId} ·{" "}
                  {paymentMethodLabel(payment.method)}
                </span>
                <span className="font-medium">{formatMoney(payment.amount)}</span>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.id ?? "Invoice"}
        className="max-w-4xl"
      >
        {selected ? (
          <InvoicePrintView invoice={selected} payments={myPayments} />
        ) : null}
      </Modal>
    </div>
  );
}
