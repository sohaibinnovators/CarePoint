"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PatientForm } from "@/components/management/patient-form";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/input";
import { Table, Td } from "@/components/ui/table";
import { SearchFilter } from "@/components/ui/search-filter";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import type { Patient } from "@/lib/types";

type SortKey = "name" | "registrationDate" | "age";

const PAGE_SIZE = 6;

export default function AdminPatientsPage() {
  const {
    ready,
    patients,
    consultations,
    prescriptions,
    invoices,
    payments,
    getMedicalRecord,
    addPatient,
    updatePatient,
    deletePatient,
  } = useCarePointStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Patient | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = patients.filter((patient) => {
      const matchesStatus =
        statusFilter === "all" || patient.status === statusFilter;
      const matchesGender =
        genderFilter === "all" || patient.gender === genderFilter;
      const matchesSearch =
        !q ||
        patient.name.toLowerCase().includes(q) ||
        patient.id.toLowerCase().includes(q) ||
        patient.phone.toLowerCase().includes(q) ||
        patient.email.toLowerCase().includes(q);
      return matchesStatus && matchesGender && matchesSearch;
    });

    list.sort((a, b) => {
      if (sortKey === "age") return a.age - b.age;
      if (sortKey === "registrationDate") {
        return b.registrationDate.localeCompare(a.registrationDate);
      }
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [patients, search, statusFilter, genderFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Search, add, edit, and manage fictional patient records. Changes persist in localStorage."
        actions={
          <Button
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
          >
            Add patient
          </Button>
        }
      />

      <p className="text-sm text-muted">{clinicInfo.demoNotice}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <SearchFilter
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by name, ID, phone, or email…"
          filter={statusFilter}
          onFilterChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          filterOptions={[
            { label: "All statuses", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
        <Select
          value={genderFilter}
          onChange={(e) => {
            setGenderFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by gender"
          className="lg:w-44"
        >
          <option value="all">All genders</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </Select>
        <Select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="Sort patients"
          className="lg:w-52"
        >
          <option value="name">Sort by name</option>
          <option value="registrationDate">Sort by registration date</option>
          <option value="age">Sort by age</option>
        </Select>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table
            headers={[
              "Patient ID",
              "Full name",
              "Age",
              "Gender",
              "Phone",
              "Email",
              "Registered",
              "Status",
              "Actions",
            ]}
          >
            {pageItems.map((patient) => (
              <tr key={patient.id}>
                <Td className="font-mono text-xs">{patient.id}</Td>
                <Td className="font-medium">{patient.name}</Td>
                <Td>{patient.age}</Td>
                <Td>{patient.gender}</Td>
                <Td>{patient.phone}</Td>
                <Td>{patient.email}</Td>
                <Td>{patient.registrationDate}</Td>
                <Td>
                  <Badge variant={statusBadgeVariant(patient.status)}>
                    {patient.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(patient)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(patient);
                        setCreating(false);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(patient)}
                    >
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          {pageItems.length === 0 ? (
            <EmptyState
              title="No patients found"
              description="Try adjusting search or filters, or add a new demo patient."
            />
          ) : null}
        </CardBody>
      </Card>

      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-muted">
          Showing {pageItems.length} of {filtered.length} patients
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="inline-flex items-center px-2">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? "Edit patient" : "Add patient"}
        description="Demo patient form — fictional records only."
        className="max-w-3xl"
      >
        <PatientForm
          key={editing?.id ?? "new-patient"}
          initial={editing}
          mode="admin"
          submitLabel={editing ? "Update patient" : "Create patient"}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={(input) => {
            if (editing) {
              updatePatient(editing.id, input);
              setToast(`Updated ${input.name}.`);
            } else {
              const created = addPatient(input);
              setToast(`Created ${created.name} (${created.id}).`);
            }
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Patient details"}
        description="Demo patient profile — not a real medical record."
        className="max-w-2xl"
      >
        {selected ? (
          <div className="space-y-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Patient ID", selected.id],
                ["Date of birth", selected.dateOfBirth],
                ["Age / Gender", `${selected.age} · ${selected.gender}`],
                ["Status", selected.status],
                ["Phone", selected.phone],
                ["Email", selected.email],
                ["Blood type", selected.bloodType],
                ["Registered", selected.registrationDate],
                ["Last visit", selected.lastVisit],
                ["Address", selected.address],
                ["Emergency contact", selected.emergencyContact],
                ["Admin notes", selected.notes || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={
                    label === "Admin notes" || label === "Address"
                      ? "sm:col-span-2"
                      : undefined
                  }
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium capitalize">{value}</dd>
                </div>
              ))}
            </dl>
            {(() => {
              const record = getMedicalRecord(selected.id);
              const consultCount = consultations.filter(
                (item) => item.patientId === selected.id,
              ).length;
              const rxCount = prescriptions.filter(
                (item) => item.patientId === selected.id,
              ).length;
              const patientInvoices = invoices.filter(
                (item) => item.patientId === selected.id,
              );
              const patientPayments = payments.filter(
                (item) => item.patientId === selected.id,
              );
              const balance = patientInvoices
                .filter(
                  (item) =>
                    item.status !== "cancelled" && item.status !== "draft",
                )
                .reduce((sum, item) => sum + item.balanceDue, 0);
              return (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-light-blue/20 p-4 text-sm">
                    <p className="font-medium">Clinical summary (demo)</p>
                    <p className="mt-2 text-muted">
                      Consultations: {consultCount} · Prescriptions: {rxCount}
                    </p>
                    <p className="mt-1 text-muted">
                      Allergies: {record.allergies.join(", ") || "None recorded"}
                    </p>
                    <p className="mt-1 text-muted">
                      Conditions: {record.conditions.join(", ") || "None recorded"}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Detailed consultation notes stay in doctor workflows.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50 p-4 text-sm">
                    <p className="font-medium">Billing summary (demo)</p>
                    <p className="mt-2 text-muted">
                      Invoices: {patientInvoices.length} · Payments:{" "}
                      {patientPayments.length}
                    </p>
                    <p className="mt-1 text-muted">
                      Outstanding balance: ${balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete patient?"
        message={
          pendingDelete
            ? `Delete ${pendingDelete.name}? Related appointments will be kept and labeled as deleted-patient records.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const result = deletePatient(pendingDelete.id);
          setToast(result.message);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
