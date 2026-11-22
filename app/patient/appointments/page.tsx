"use client";

import { useMemo, useState } from "react";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { DataToolbar } from "@/components/dashboard/data-toolbar";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";

const PATIENT_ID = "pt-1001";

const TABS = [
  { id: "mine", label: "My appointments" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all-status", label: "By status" },
];

export default function PatientAppointmentsPage() {
  const { ready, appointments } = useCarePointStore();
  const [tab, setTab] = useState("mine");
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");

  const mine = useMemo(
    () =>
      appointments
        .filter((a) => a.patientId === PATIENT_ID)
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [appointments],
  );

  const baseList = useMemo(() => {
    if (tab === "upcoming") {
      return mine.filter(
        (a) => a.status !== "cancelled" && a.status !== "completed",
      );
    }
    return mine;
  }, [mine, tab]);

  const filtered = useMemo(() => {
    let list = baseList;
    if (tab === "all-status" && statusTab !== "all") {
      list = list.filter((a) => a.status === statusTab);
    }
    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter(
      (a) =>
        a.doctorName.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q),
    );
  }, [baseList, tab, statusTab, search]);

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        description="Your demo visits from the shared CarePoint store."
      />

      <Card>
        <CardBody className="space-y-4">
          <DataToolbar
            tabs={TABS}
            activeTab={tab}
            onTabChange={(id) => {
              setTab(id);
              if (id !== "all-status") setStatusTab("all");
            }}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search doctor, type, department…"
          />
          {tab === "all-status" ? (
            <DataToolbar
              tabs={[
                { id: "all", label: "All" },
                { id: "confirmed", label: "Confirmed" },
                { id: "scheduled", label: "Scheduled" },
                { id: "completed", label: "Completed" },
                { id: "cancelled", label: "Cancelled" },
              ]}
              activeTab={statusTab}
              onTabChange={setStatusTab}
            />
          ) : null}
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No appointments match this view.
            </p>
          ) : (
            <Table headers={["Date", "Time", "Doctor", "Type", "Status"]}>
              {filtered.map((apt) => (
                <tr key={apt.id}>
                  <Td>{apt.date}</Td>
                  <Td>{apt.time}</Td>
                  <Td className="font-medium">{apt.doctorName}</Td>
                  <Td>{apt.type}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(apt.status)}>
                      {apt.status.replace("-", " ")}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
          <p className="text-xs text-muted">{clinicInfo.demoNotice}</p>
        </CardBody>
      </Card>
    </div>
  );
}
