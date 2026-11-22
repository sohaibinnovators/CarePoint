"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InvoiceForm } from "@/components/billing/invoice-form";
import { InvoicePrintView } from "@/components/billing/invoice-print";
import { PaymentForm } from "@/components/billing/payment-form";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/input";
import { Table, Td } from "@/components/ui/table";
import { SearchFilter } from "@/components/ui/search-filter";
import { useCarePointStore } from "@/lib/carepoint-store";
import {
  DEMO_BILLING_NOTICE,
  downloadCsv,
  formatMoney,
  invoiceStatusLabel,
  paymentMethodLabel,
} from "@/lib/billing";
import type { Invoice, InvoiceInput, PaymentInput } from "@/lib/types";
import {
  CreditCard,
  DollarSign,
  FileText,
  AlertTriangle,
  Wallet,
} from "lucide-react";

type SortKey = "date" | "amount" | "patient";

export function BillingWorkspace({
  title,
  description,
  showExpenseLink = false,
}: {
  title: string;
  description: string;
  showExpenseLink?: boolean;
}) {
  const {
    ready,
    patients,
    doctors,
    appointments,
    services,
    invoices,
    payments,
    billingSummary,
    saveInvoice,
    issueInvoice,
    cancelInvoice,
    recordPayment,
  } = useCarePointStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = invoices.filter((invoice) => {
      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;
      const matchesSearch =
        !q ||
        invoice.id.toLowerCase().includes(q) ||
        invoice.patientName.toLowerCase().includes(q) ||
        invoice.items.some((item) =>
          item.description.toLowerCase().includes(q),
        );
      const matchesFrom = !fromDate || invoice.date >= fromDate;
      const matchesTo = !toDate || invoice.date <= toDate;
      return matchesStatus && matchesSearch && matchesFrom && matchesTo;
    });

    list.sort((a, b) => {
      if (sortKey === "amount") return b.total - a.total;
      if (sortKey === "patient") return a.patientName.localeCompare(b.patientName);
      return `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`);
    });
    return list;
  }, [invoices, search, statusFilter, fromDate, toDate, sortKey]);

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [payments],
  );

  if (!ready) return <StoreLoading />;

  function handleSaveInvoice(input: InvoiceInput, existingId?: string) {
    const result = saveInvoice(input, existingId);
    if ("error" in result) {
      setToast(result.error);
      return;
    }
    setToast(`Saved ${result.id} (${invoiceStatusLabel(result.status)}).`);
    setCreating(false);
    setEditing(null);
  }

  function handlePayment(input: PaymentInput) {
    const result = recordPayment(input);
    if ("error" in result) {
      setToast(result.error);
      return;
    }
    setToast(`Recorded payment ${result.id} for ${formatMoney(result.amount)}.`);
    setPaying(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap gap-2">
            {showExpenseLink ? (
              <Link href="/admin/expenses">
                <Button size="sm" variant="outline">
                  Expenses
                </Button>
              </Link>
            ) : null}
            <Button size="sm" onClick={() => setCreating(true)}>
              Create invoice
            </Button>
          </div>
        }
      />
      <p className="text-xs text-muted">{DEMO_BILLING_NOTICE}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total billed"
          value={formatMoney(billingSummary.totalBilled)}
          hint="Excludes draft/cancelled"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Collected"
          value={formatMoney(billingSummary.totalCollected)}
          hint="From payment records"
          tone="emerald"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Pending"
          value={formatMoney(billingSummary.pendingPayments)}
          hint="Outstanding balances"
          tone="amber"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          title="Overdue invoices"
          value={billingSummary.overdueInvoices}
          hint="Past due date"
          tone="amber"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          title="Total invoices"
          value={billingSummary.totalInvoices}
          hint="All statuses"
          tone="teal"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          title="Today's collections"
          value={formatMoney(billingSummary.todaysCollections)}
          hint="Demo clinic date"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent invoices" />
          <CardBody className="space-y-3">
            {invoices.slice(0, 5).map((invoice) => (
              <button
                key={invoice.id}
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => setSelected(invoice)}
              >
                <span>
                  {invoice.id} · {invoice.patientName}
                </span>
                <span className="font-medium">{formatMoney(invoice.total)}</span>
              </button>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent payments" />
          <CardBody className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted">No payments recorded yet.</p>
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {payment.patientName} · {paymentMethodLabel(payment.method)}
                  </span>
                  <span className="font-medium">
                    {formatMoney(payment.amount)}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search invoice ID or patient…"
            filter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={[
              { label: "All statuses", value: "all" },
              { label: "Draft", value: "draft" },
              { label: "Unpaid", value: "unpaid" },
              { label: "Partially paid", value: "partially-paid" },
              { label: "Paid", value: "paid" },
              { label: "Overdue", value: "overdue" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Sort by</label>
              <Select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="patient">Patient</option>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "carepoint-invoices.csv",
                  filtered.map((invoice) => ({
                    id: invoice.id,
                    patient: invoice.patientName,
                    date: invoice.date,
                    dueDate: invoice.dueDate,
                    total: invoice.total,
                    paid: invoice.amountPaid,
                    balance: invoice.balanceDue,
                    status: invoice.status,
                  })),
                )
              }
            >
              Export CSV
            </Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No invoices found"
              description="Adjust filters or create a new demo invoice."
            />
          ) : (
            <Table
              headers={[
                "Invoice",
                "Patient",
                "Date",
                "Total",
                "Balance",
                "Status",
                "Actions",
              ]}
            >
              {filtered.map((invoice) => (
                <tr key={invoice.id}>
                  <Td className="font-medium">{invoice.id}</Td>
                  <Td>{invoice.patientName}</Td>
                  <Td>{invoice.date}</Td>
                  <Td>{formatMoney(invoice.total)}</Td>
                  <Td>{formatMoney(invoice.balanceDue)}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(invoice.status)}>
                      {invoiceStatusLabel(invoice.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(invoice)}
                      >
                        View
                      </Button>
                      {invoice.status === "draft" ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditing(invoice)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const result = issueInvoice(invoice.id);
                              if ("error" in result) setToast(result.error);
                              else setToast(`Issued ${result.id}.`);
                            }}
                          >
                            Issue
                          </Button>
                        </>
                      ) : null}
                      {invoice.status !== "cancelled" &&
                      invoice.status !== "draft" &&
                      invoice.balanceDue > 0 ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPaying(invoice)}
                        >
                          Pay
                        </Button>
                      ) : null}
                      {invoice.status !== "cancelled" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCancelTarget(invoice)}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? `Edit ${editing.id}` : "Create invoice"}
        description="Demo invoice form — fictional amounts only."
        className="max-w-4xl"
      >
        <InvoiceForm
          patients={patients}
          doctors={doctors}
          appointments={appointments}
          services={services}
          initial={editing}
          onSave={handleSaveInvoice}
        />
      </Modal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.id ?? "Invoice"}
        description="Demo invoice detail and printable layout."
        className="max-w-4xl"
      >
        {selected ? (
          <InvoicePrintView invoice={selected} payments={payments} />
        ) : null}
      </Modal>

      <Modal
        open={paying !== null}
        onClose={() => setPaying(null)}
        title={paying ? `Payment for ${paying.id}` : "Payment"}
        description="Simulated payment only — no real card data is collected."
        className="max-w-2xl"
      >
        {paying ? (
          <PaymentForm invoice={paying} onSave={handlePayment} />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel invoice?"
        message={
          cancelTarget
            ? `Cancel ${cancelTarget.id}? New payments will be blocked.`
            : ""
        }
        confirmLabel="Cancel invoice"
        danger
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          const result = cancelInvoice(cancelTarget.id);
          if ("error" in result) setToast(result.error);
          else setToast(`Cancelled ${result.id}.`);
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
