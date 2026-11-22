"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  DEMO_BILLING_NOTICE,
  formatMoney,
  PAYMENT_METHODS,
  validatePaymentInput,
} from "@/lib/billing";
import { clinicTodayIso } from "@/lib/time";
import type { Invoice, PaymentInput, PaymentMethod } from "@/lib/types";

export function PaymentForm({
  invoice,
  onSave,
}: {
  invoice: Invoice;
  onSave: (input: PaymentInput) => void;
}) {
  const [date, setDate] = useState(clinicTodayIso());
  const [amount, setAmount] = useState(String(invoice.balanceDue));
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const input: PaymentInput = {
      invoiceId: invoice.id,
      date,
      amount: Number(amount) || 0,
      method,
      reference,
      notes,
    };
    const validationError = validatePaymentInput({
      amount: input.amount,
      balanceDue: invoice.balanceDue,
      invoiceStatus: invoice.status,
      date: input.date,
      method: input.method,
    });
    setError(validationError);
    if (validationError) return;
    onSave(input);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{DEMO_BILLING_NOTICE}</p>
      <p className="text-sm">
        Remaining balance: <strong>{formatMoney(invoice.balanceDue)}</strong>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Amount">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label="Payment method">
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Transaction reference (optional)">
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Simulated reference only"
          />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="button" onClick={submit}>
        Record demo payment
      </Button>
    </div>
  );
}
