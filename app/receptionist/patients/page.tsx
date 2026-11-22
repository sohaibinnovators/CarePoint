"use client";

import { useMemo, useState } from "react";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PatientForm } from "@/components/management/patient-form";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, Td } from "@/components/ui/table";
import { SearchFilter } from "@/components/ui/search-filter";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import type { Patient } from "@/lib/types";

export default function ReceptionistPatientsPage() {
  const { ready, patients, updatePatient } = useCarePointStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q),
    );
  }, [patients, search]);

  if (!ready) return <StoreLoading />;

  return (
    <>
      <PageHeader
        title="Patient Directory"
        description="Search the live demo patient registry. Changes sync with admin views via localStorage."
      />

      {toast ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, ID, phone, or email…"
          />
          {filtered.length === 0 ? (
            <EmptyState
              title="No patients found"
              description="Try a different search or register a new patient at the front desk."
            />
          ) : (
            <Table
              headers={[
                "ID",
                "Name",
                "Contact",
                "Registered",
                "Last visit",
                "Status",
                "Actions",
              ]}
            >
              {filtered.map((patient) => (
                <tr key={patient.id}>
                  <Td className="font-mono text-xs">{patient.id}</Td>
                  <Td className="font-medium">{patient.name}</Td>
                  <Td>
                    <div className="text-sm">{patient.phone}</div>
                    <div className="text-xs text-muted">{patient.email}</div>
                  </Td>
                  <Td>{patient.registrationDate}</Td>
                  <Td>{patient.lastVisit}</Td>
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
                        onClick={() => setEditing(patient)}
                      >
                        Edit
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
          <p className="text-xs text-muted">{clinicInfo.demoNotice}</p>
        </CardBody>
      </Card>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Patient details"}
        description="Front-desk demographics only — clinical notes and prescriptions are hidden in receptionist workflows."
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
                ["Registered", selected.registrationDate],
                ["Last visit", selected.lastVisit],
                ["Address", selected.address],
                ["Emergency contact", selected.emergencyContact],
                ["Front-desk notes", selected.notes || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={
                    label === "Front-desk notes" || label === "Address"
                      ? "sm:col-span-2"
                      : undefined
                  }
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium capitalize">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Receptionist view excludes medical history details, consultation notes,
              diagnoses, and prescriptions. Use doctor or admin clinical screens for those.
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit patient"
        description="Updates persist in localStorage for this demo browser."
        className="max-w-3xl"
      >
        {editing ? (
          <PatientForm
            key={editing.id}
            initial={editing}
            mode="front-desk"
            submitLabel="Update patient"
            onCancel={() => setEditing(null)}
            onSubmit={(input) => {
              updatePatient(editing.id, {
                ...input,
                bloodType: editing.bloodType,
                condition: editing.condition,
              });
              setToast(`Updated ${input.name}.`);
              setEditing(null);
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}