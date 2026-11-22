import { clinicTodayIso, compareIsoDates } from "./time";
import type {
  Expense,
  ExpenseCategory,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  Payment,
  PaymentMethod,
} from "./types";

export const DEMO_BILLING_NOTICE =
  "Fictional demo billing data only — not a real accounting system or payment gateway.";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "card", label: "Card (simulated)" },
  { value: "other", label: "Other" },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "staff-salaries", label: "Staff Salaries" },
  { value: "medical-supplies", label: "Medical Supplies" },
  { value: "equipment", label: "Equipment" },
  { value: "utilities", label: "Utilities" },
  { value: "rent", label: "Rent" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatMoney(value: number) {
  return `$${roundMoney(value).toFixed(2)}`;
}

export function paymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHODS.find((item) => item.value === method)?.label ?? method;
}

export function expenseCategoryLabel(category: ExpenseCategory) {
  return (
    EXPENSE_CATEGORIES.find((item) => item.value === category)?.label ?? category
  );
}

export function invoiceStatusLabel(status: InvoiceStatus) {
  return status.replace("-", " ");
}

export function calculateInvoiceTotals(options: {
  items: Array<Pick<InvoiceLineItem, "quantity" | "unitPrice">>;
  discount: number;
  taxRate: number;
  amountPaid?: number;
}) {
  const subtotal = roundMoney(
    options.items.reduce(
      (sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
      0,
    ),
  );
  const discount = roundMoney(Math.max(0, options.discount || 0));
  const taxable = Math.max(0, subtotal - discount);
  const taxRate = Math.max(0, options.taxRate || 0);
  const taxAmount = roundMoney(taxable * (taxRate / 100));
  const total = roundMoney(taxable + taxAmount);
  const amountPaid = roundMoney(Math.max(0, options.amountPaid || 0));
  const balanceDue = roundMoney(Math.max(0, total - amountPaid));
  return { subtotal, discount, taxRate, taxAmount, total, amountPaid, balanceDue };
}

export function deriveInvoiceStatus(options: {
  status?: InvoiceStatus;
  total: number;
  amountPaid: number;
  dueDate: string;
  today?: string;
}): InvoiceStatus {
  if (options.status === "cancelled") return "cancelled";
  if (options.status === "draft") return "draft";

  const paid = roundMoney(options.amountPaid);
  const total = roundMoney(options.total);
  if (total <= 0 || paid >= total) return "paid";
  if (paid > 0) return "partially-paid";

  const today = options.today || clinicTodayIso();
  if (compareIsoDates(options.dueDate, today) < 0) return "overdue";
  return "unpaid";
}

export function refreshInvoiceFinancials(
  invoice: Invoice,
  payments: Payment[],
  today = clinicTodayIso(),
): Invoice {
  const amountPaid = roundMoney(
    payments
      .filter((payment) => payment.invoiceId === invoice.id)
      .reduce((sum, payment) => sum + payment.amount, 0),
  );
  const totals = calculateInvoiceTotals({
    items: invoice.items,
    discount: invoice.discount,
    taxRate: invoice.taxRate,
    amountPaid,
  });
  return {
    ...invoice,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,
    amountPaid: totals.amountPaid,
    balanceDue: totals.balanceDue,
    status: deriveInvoiceStatus({
      status: invoice.status,
      total: totals.total,
      amountPaid: totals.amountPaid,
      dueDate: invoice.dueDate,
      today,
    }),
  };
}

export function validateInvoiceInput(input: {
  patientId: string;
  date: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  discount: number;
  taxRate: number;
}) {
  const errors: Record<string, string> = {};
  if (!input.patientId) errors.patientId = "Select a patient.";
  if (!input.date) errors.date = "Invoice date is required.";
  if (!input.dueDate) errors.dueDate = "Due date is required.";
  if (input.date && input.dueDate && input.dueDate < input.date) {
    errors.dueDate = "Due date cannot be before the invoice date.";
  }
  if (input.discount < 0) errors.discount = "Discount cannot be negative.";
  if (input.taxRate < 0) errors.taxRate = "Tax rate cannot be negative.";
  if (input.taxRate > 100) errors.taxRate = "Tax rate cannot exceed 100%.";
  if (!input.items.length) {
    errors.items = "Add at least one line item.";
  } else {
    input.items.forEach((item, index) => {
      if (!item.description.trim()) {
        errors[`item-${index}-description`] = "Description is required.";
      }
      if (!(item.quantity > 0)) {
        errors[`item-${index}-quantity`] = "Quantity must be greater than 0.";
      }
      if (!(item.unitPrice >= 0)) {
        errors[`item-${index}-unitPrice`] = "Unit price cannot be negative.";
      }
    });
  }
  const totals = calculateInvoiceTotals(input);
  if (totals.discount > totals.subtotal) {
    errors.discount = "Discount cannot exceed subtotal.";
  }
  return errors;
}

export function validatePaymentInput(options: {
  amount: number;
  balanceDue: number;
  invoiceStatus: InvoiceStatus;
  date: string;
  method: PaymentMethod;
}) {
  if (options.invoiceStatus === "cancelled") {
    return "Cancelled invoices cannot accept payments.";
  }
  if (options.invoiceStatus === "draft") {
    return "Issue the invoice before recording payments.";
  }
  if (options.invoiceStatus === "paid" || options.balanceDue <= 0) {
    return "This invoice has no remaining balance.";
  }
  if (!options.date) return "Payment date is required.";
  if (!options.method) return "Select a payment method.";
  if (!(options.amount > 0)) return "Payment amount must be greater than 0.";
  if (roundMoney(options.amount) > roundMoney(options.balanceDue) + 0.001) {
    return "Payment cannot exceed the remaining balance.";
  }
  return null;
}

export function validateExpenseInput(input: {
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
}) {
  const errors: Record<string, string> = {};
  if (!input.title.trim()) errors.title = "Title is required.";
  if (!input.date) errors.date = "Date is required.";
  if (!input.category) errors.category = "Category is required.";
  if (!(input.amount > 0)) errors.amount = "Amount must be greater than 0.";
  return errors;
}

export function activePayments(payments: Payment[], invoices: Invoice[]) {
  const cancelled = new Set(
    invoices
      .filter((invoice) => invoice.status === "cancelled")
      .map((invoice) => invoice.id),
  );
  return payments.filter((payment) => !cancelled.has(payment.invoiceId));
}

export function sumPayments(payments: Payment[]) {
  return roundMoney(payments.reduce((sum, payment) => sum + payment.amount, 0));
}

export function sumExpenses(expenses: Expense[]) {
  return roundMoney(expenses.reduce((sum, expense) => sum + expense.amount, 0));
}

export function outstandingBalance(invoices: Invoice[]) {
  return roundMoney(
    invoices
      .filter((invoice) => invoice.status !== "cancelled" && invoice.status !== "draft")
      .reduce((sum, invoice) => sum + invoice.balanceDue, 0),
  );
}

export function totalBilled(invoices: Invoice[]) {
  return roundMoney(
    invoices
      .filter((invoice) => invoice.status !== "cancelled" && invoice.status !== "draft")
      .reduce((sum, invoice) => sum + invoice.total, 0),
  );
}

export function buildBillingSummary(options: {
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  today?: string;
}) {
  const today = options.today || clinicTodayIso();
  const countablePayments = activePayments(options.payments, options.invoices);
  const collected = sumPayments(countablePayments);
  const expensesTotal = sumExpenses(options.expenses);
  const todaysCollections = sumPayments(
    countablePayments.filter((payment) => payment.date === today),
  );
  return {
    totalBilled: totalBilled(options.invoices),
    totalCollected: collected,
    pendingPayments: outstandingBalance(options.invoices),
    overdueInvoices: options.invoices.filter((invoice) => invoice.status === "overdue")
      .length,
    totalInvoices: options.invoices.length,
    todaysCollections,
    totalExpenses: expensesTotal,
    netOperatingBalance: roundMoney(collected - expensesTotal),
    paidInvoices: options.invoices.filter((invoice) => invoice.status === "paid").length,
    draftInvoices: options.invoices.filter((invoice) => invoice.status === "draft").length,
  };
}

export function paymentsByMethod(payments: Payment[]) {
  const map = new Map<PaymentMethod, number>();
  for (const payment of payments) {
    map.set(payment.method, roundMoney((map.get(payment.method) || 0) + payment.amount));
  }
  return PAYMENT_METHODS.map((method) => ({
    label: method.label,
    value: map.get(method.value) || 0,
  }));
}

export function monthlyTotals(
  records: Array<{ date: string; amount: number }>,
  year: number,
) {
  const months = Array.from({ length: 12 }, (_, index) => ({
    label: new Date(Date.UTC(year, index, 1)).toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    }),
    value: 0,
  }));
  for (const record of records) {
    if (!record.date.startsWith(String(year))) continue;
    const month = Number(record.date.slice(5, 7)) - 1;
    if (month >= 0 && month < 12) {
      months[month].value = roundMoney(months[month].value + record.amount);
    }
  }
  return months;
}

export function filterByDateRange<T extends { date: string }>(
  records: T[],
  from?: string,
  to?: string,
) {
  return records.filter((record) => {
    if (from && compareIsoDates(record.date, from) < 0) return false;
    if (to && compareIsoDates(record.date, to) > 0) return false;
    return true;
  });
}

export function toCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => {
    const text = String(value);
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => escape(row[key] ?? "")).join(",")),
  ].join("\n");
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (typeof window === "undefined") return;
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ageGroup(age: number) {
  if (age < 18) return "0-17";
  if (age < 35) return "18-34";
  if (age < 50) return "35-49";
  if (age < 65) return "50-64";
  return "65+";
}
