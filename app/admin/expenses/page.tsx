"use client";

import { useMemo, useState } from "react";
import { ExpenseForm } from "@/components/billing/expense-form";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, StatCard } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, Td } from "@/components/ui/table";
import { SearchFilter } from "@/components/ui/search-filter";
import { useCarePointStore } from "@/lib/carepoint-store";
import {
  DEMO_BILLING_NOTICE,
  downloadCsv,
  expenseCategoryLabel,
  formatMoney,
  paymentMethodLabel,
  sumExpenses,
} from "@/lib/billing";
import type { Expense, ExpenseInput } from "@/lib/types";
import { DollarSign, Receipt } from "lucide-react";

export default function AdminExpensesPage() {
  const {
    ready,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useCarePointStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses
      .filter((expense) => {
        const matchesCategory =
          categoryFilter === "all" || expense.category === categoryFilter;
        const matchesSearch =
          !q ||
          expense.title.toLowerCase().includes(q) ||
          expense.description.toLowerCase().includes(q) ||
          (expense.reference || "").toLowerCase().includes(q);
        const matchesFrom = !fromDate || expense.date >= fromDate;
        const matchesTo = !toDate || expense.date <= toDate;
        return matchesCategory && matchesSearch && matchesFrom && matchesTo;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search, categoryFilter, fromDate, toDate]);

  const monthlyTotal = useMemo(() => {
    const month = "2026-11";
    return sumExpenses(expenses.filter((expense) => expense.date.startsWith(month)));
  }, [expenses]);

  if (!ready) return <StoreLoading />;

  function handleSave(input: ExpenseInput) {
    if (editing) {
      const result = updateExpense(editing.id, input);
      if ("error" in result) {
        setToast(result.error);
        return;
      }
      setToast(`Updated ${result.title}.`);
      setEditing(null);
      return;
    }
    const result = addExpense(input);
    if ("error" in result) {
      setToast(result.error);
      return;
    }
    setToast(`Added ${result.title}.`);
    setCreating(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        description="Track fictional clinic operating expenses for demo reports."
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            Add expense
          </Button>
        }
      />
      <p className="text-xs text-muted">{DEMO_BILLING_NOTICE}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total expenses"
          value={formatMoney(sumExpenses(expenses))}
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          title="November expenses"
          value={formatMoney(monthlyTotal)}
          tone="amber"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardBody className="space-y-4">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search expenses…"
            filter={categoryFilter}
            onFilterChange={setCategoryFilter}
            filterOptions={[
              { label: "All categories", value: "all" },
              { label: "Staff Salaries", value: "staff-salaries" },
              { label: "Medical Supplies", value: "medical-supplies" },
              { label: "Equipment", value: "equipment" },
              { label: "Utilities", value: "utilities" },
              { label: "Rent", value: "rent" },
              { label: "Maintenance", value: "maintenance" },
              { label: "Other", value: "other" },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadCsv(
                "carepoint-expenses.csv",
                filtered.map((expense) => ({
                  id: expense.id,
                  title: expense.title,
                  category: expense.category,
                  amount: expense.amount,
                  date: expense.date,
                  method: expense.paymentMethod,
                  reference: expense.reference || "",
                })),
              )
            }
          >
            Export CSV
          </Button>

          {filtered.length === 0 ? (
            <EmptyState
              title="No expenses found"
              description="Add a demo expense or adjust filters."
            />
          ) : (
            <Table
              headers={[
                "Title",
                "Category",
                "Date",
                "Amount",
                "Method",
                "Actions",
              ]}
            >
              {filtered.map((expense) => (
                <tr key={expense.id}>
                  <Td className="font-medium">{expense.title}</Td>
                  <Td>{expenseCategoryLabel(expense.category)}</Td>
                  <Td>{expense.date}</Td>
                  <Td>{formatMoney(expense.amount)}</Td>
                  <Td>{paymentMethodLabel(expense.paymentMethod)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(expense)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingDelete(expense)}
                      >
                        Delete
                      </Button>
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
        title={editing ? "Edit expense" : "Add expense"}
        className="max-w-2xl"
      >
        <ExpenseForm
          initial={editing}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete expense?"
        message={
          pendingDelete
            ? `Delete “${pendingDelete.title}”? This only affects local demo data.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const result = deleteExpense(pendingDelete.id);
          setToast(result.message);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
