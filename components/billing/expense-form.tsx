"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  DEMO_BILLING_NOTICE,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  validateExpenseInput,
} from "@/lib/billing";
import { clinicTodayIso } from "@/lib/time";
import type {
  Expense,
  ExpenseCategory,
  ExpenseInput,
  PaymentMethod,
} from "@/lib/types";

export function ExpenseForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Expense | null;
  onSave: (input: ExpenseInput) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState<ExpenseCategory>(
    initial?.category || "other",
  );
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial?.date || clinicTodayIso());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod || "bank-transfer",
  );
  const [description, setDescription] = useState(initial?.description || "");
  const [reference, setReference] = useState(initial?.reference || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title);
    setCategory(initial.category);
    setAmount(String(initial.amount));
    setDate(initial.date);
    setPaymentMethod(initial.paymentMethod);
    setDescription(initial.description);
    setReference(initial.reference || "");
  }, [initial]);

  function submit() {
    const input: ExpenseInput = {
      title,
      category,
      amount: Number(amount) || 0,
      date,
      paymentMethod,
      description,
      reference,
    };
    const nextErrors = validateExpenseInput(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(input);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{DEMO_BILLING_NOTICE}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" error={errors.title}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Category" error={errors.category}>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Amount" error={errors.amount}>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label="Date" error={errors.date}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Payment method">
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reference (optional)">
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={submit}>
          {initial ? "Update expense" : "Save expense"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}
