"use client";

import { Button } from "@/components/ui/button";
import {
  DEMO_BILLING_NOTICE,
  formatMoney,
  invoiceStatusLabel,
} from "@/lib/billing";
import type { Invoice, Payment } from "@/lib/types";

export function InvoicePrintView({
  invoice,
  payments = [],
}: {
  invoice: Invoice;
  payments?: Payment[];
}) {
  const related = payments.filter((payment) => payment.invoiceId === invoice.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <p className="text-xs text-muted">{DEMO_BILLING_NOTICE}</p>
        <Button type="button" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 print:border-0">
        <div className="border-b border-border pb-4">
          <h2 className="text-xl font-semibold">CarePoint Demo Invoice</h2>
          <p className="mt-1 text-sm text-muted">
            Portfolio financial demonstration — not a real bill.
          </p>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted">Invoice:</span> {invoice.id}
          </p>
          <p>
            <span className="text-muted">Status:</span>{" "}
            {invoiceStatusLabel(invoice.status)}
          </p>
          <p>
            <span className="text-muted">Patient:</span> {invoice.patientName}
          </p>
          <p>
            <span className="text-muted">Doctor:</span>{" "}
            {invoice.doctorName || "—"}
          </p>
          <p>
            <span className="text-muted">Invoice date:</span> {invoice.date}
          </p>
          <p>
            <span className="text-muted">Due date:</span> {invoice.dueDate}
          </p>
        </div>

        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted">
              <th className="py-2">Description</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Unit</th>
              <th className="py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="py-3">{item.description}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">{formatMoney(item.unitPrice)}</td>
                <td className="py-3">
                  {formatMoney(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <p className="flex justify-between gap-4">
            <span className="text-muted">Subtotal</span>
            <span>{formatMoney(invoice.subtotal)}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-muted">Discount</span>
            <span>{formatMoney(invoice.discount)}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-muted">Tax ({invoice.taxRate}%)</span>
            <span>{formatMoney(invoice.taxAmount)}</span>
          </p>
          <p className="flex justify-between gap-4 font-semibold">
            <span>Total</span>
            <span>{formatMoney(invoice.total)}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-muted">Paid</span>
            <span>{formatMoney(invoice.amountPaid)}</span>
          </p>
          <p className="flex justify-between gap-4 font-semibold">
            <span>Balance due</span>
            <span>{formatMoney(invoice.balanceDue)}</span>
          </p>
        </div>

        {invoice.notes ? (
          <p className="mt-4 text-sm">
            <span className="text-muted">Notes:</span> {invoice.notes}
          </p>
        ) : null}

        {related.length ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold">Payment history</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {related.map((payment) => (
                <li key={payment.id}>
                  {payment.date} · {formatMoney(payment.amount)} · {payment.method}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
