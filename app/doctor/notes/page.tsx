"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { SearchFilter } from "@/components/ui/search-filter";
import { useCarePointStore } from "@/lib/carepoint-store";
import { DEMO_CLINICAL_NOTICE } from "@/lib/clinical";

const DOCTOR_ID = "dr-elena-hayes";

export default function DoctorNotesPage() {
  const { ready, consultations, appointments } = useCarePointStore();
  const [search, setSearch] = useState("");

  const notes = useMemo(() => {
    return consultations
      .filter((item) => item.doctorId === DOCTOR_ID)
      .filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.chiefComplaint.toLowerCase().includes(q) ||
          item.diagnosis.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [consultations, search]);

  const eligibleToday = useMemo(() => {
    return appointments.filter(
      (apt) =>
        apt.doctorId === DOCTOR_ID &&
        (apt.status === "confirmed" ||
          apt.status === "checked-in" ||
          apt.status === "completed"),
    );
  }, [appointments]);

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Notes"
        description="Consultation notes recorded through the clinical workflow."
      />
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>

      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-medium">Eligible appointments for consult</p>
          {eligibleToday.length === 0 ? (
            <p className="text-sm text-muted">No eligible appointments right now.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {eligibleToday.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/doctor/consultations/${apt.id}`}
                  className="rounded-lg border border-border px-3 py-2 text-sm hover:border-primary"
                >
                  {apt.patientName} · {apt.date} {apt.time}
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search notes by patient, complaint, or diagnosis…"
      />

      {notes.length === 0 ? (
        <EmptyState
          title="No consultation notes yet"
          description="Open an eligible appointment to record demo consultation notes."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{note.patientName}</h3>
                  <Badge variant={note.status === "finalized" ? "success" : "warning"}>
                    {note.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {note.updatedAt.slice(0, 10)} · {note.id}
                </p>
                <p className="mt-2 text-sm">{note.chiefComplaint}</p>
                <p className="mt-1 text-sm text-muted">
                  Diagnosis (demo): {note.diagnosis || "—"}
                </p>
                <Link
                  href={`/doctor/consultations/${note.appointmentId}`}
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Open consultation
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
