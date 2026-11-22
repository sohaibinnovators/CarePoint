"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Td } from "@/components/ui/table";
import { SearchFilter } from "@/components/ui/search-filter";
import { useCarePointStore } from "@/lib/carepoint-store";
import { DEMO_CLINICAL_NOTICE } from "@/lib/clinical";

export default function DoctorPatientsPage() {
  const { ready, patients, consultations, prescriptions, getMedicalRecord } =
    useCarePointStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q),
    );
  }, [patients, search]);

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Records"
        description="Browse demo charts, medical history, and clinical activity."
      />
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>

      <Card>
        <CardBody className="space-y-4">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search patients by name, ID, or condition…"
          />
          {filtered.length === 0 ? (
            <EmptyState
              title="No patients found"
              description="Try a different search term."
            />
          ) : (
            <Table
              headers={[
                "Patient",
                "Age",
                "Allergies",
                "Consults",
                "Rx",
                "Status",
                "",
              ]}
            >
              {filtered.map((patient) => {
                const record = getMedicalRecord(patient.id);
                const consultCount = consultations.filter(
                  (item) => item.patientId === patient.id,
                ).length;
                const rxCount = prescriptions.filter(
                  (item) => item.patientId === patient.id,
                ).length;
                return (
                  <tr key={patient.id}>
                    <Td className="font-medium">{patient.name}</Td>
                    <Td>{patient.age}</Td>
                    <Td className="max-w-[12rem] truncate">
                      {record.allergies.join(", ") || "None"}
                    </Td>
                    <Td>{consultCount}</Td>
                    <Td>{rxCount}</Td>
                    <Td>
                      <Badge variant={statusBadgeVariant(patient.status)}>
                        {patient.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Link
                        href={`/doctor/patients/${patient.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View chart
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
