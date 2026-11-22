"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { DoctorForm } from "@/components/management/doctor-form";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/input";
import { Table, Td } from "@/components/ui/table";
import { SearchFilter } from "@/components/ui/search-filter";
import { useCarePointStore } from "@/lib/carepoint-store";
import { getDoctorImage } from "@/lib/media";
import { clinicInfo } from "@/lib/mock-data";
import type { Doctor } from "@/lib/types";

type SortKey = "name" | "experienceYears";

const PAGE_SIZE = 8;

function DoctorAvatar({ doctor }: { doctor: Doctor }) {
  const preview = doctor.imagePreview?.trim() || getDoctorImage(doctor.id);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={preview}
      alt=""
      className="h-9 w-9 rounded-full object-cover"
    />
  );
}

export default function AdminDoctorsPage() {
  const {
    ready,
    doctors,
    departments,
    addDoctor,
    updateDoctor,
    deleteDoctor,
  } = useCarePointStore();

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [view, setView] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Doctor | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = doctors.filter((doctor) => {
      const matchesDept =
        departmentFilter === "all" || doctor.departmentId === departmentFilter;
      const matchesAvail =
        availabilityFilter === "all" ||
        doctor.availabilityStatus === availabilityFilter;
      const matchesSearch =
        !q ||
        doctor.name.toLowerCase().includes(q) ||
        doctor.specialty.toLowerCase().includes(q) ||
        doctor.id.toLowerCase().includes(q);
      return matchesDept && matchesAvail && matchesSearch;
    });
    list.sort((a, b) => {
      if (sortKey === "experienceYears") {
        return b.experienceYears - a.experienceYears;
      }
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [doctors, search, departmentFilter, availabilityFilter, sortKey]);

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
        title="Doctors"
        description="Search, add, edit, and manage demo clinicians. Changes persist in localStorage."
        actions={
          <Button
            onClick={() => {
              setCreating(true);
              setEditing(null);
              setFormError(null);
            }}
          >
            Add doctor
          </Button>
        }
      />

      <p className="text-sm text-muted">{clinicInfo.demoNotice}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <SearchFilter
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by name or specialty…"
          filter={availabilityFilter}
          onFilterChange={(value) => {
            setAvailabilityFilter(value);
            setPage(1);
          }}
          filterOptions={[
            { label: "All availability", value: "all" },
            { label: "Available", value: "available" },
            { label: "Unavailable", value: "unavailable" },
          ]}
        />
        <Select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by department"
          className="lg:w-48"
        >
          <option value="all">All departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </Select>
        <Select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="Sort doctors"
          className="lg:w-48"
        >
          <option value="name">Sort by name</option>
          <option value="experienceYears">Sort by experience</option>
        </Select>
        <Select
          value={view}
          onChange={(e) => setView(e.target.value as "table" | "cards")}
          aria-label="View mode"
          className="lg:w-36"
        >
          <option value="table">Table</option>
          <option value="cards">Cards</option>
        </Select>
      </div>

      {view === "table" ? (
        <Card>
          <CardBody className="p-0">
            <Table
              headers={[
                "",
                "Doctor",
                "Specialty",
                "Department",
                "Experience",
                "Fee",
                "Availability",
                "Actions",
              ]}
            >
              {pageItems.map((doctor) => (
                <tr key={doctor.id}>
                  <Td>
                    <DoctorAvatar doctor={doctor} />
                  </Td>
                  <Td>
                    <p className="font-medium">{doctor.name}</p>
                    <p className="font-mono text-xs text-muted">{doctor.id}</p>
                  </Td>
                  <Td>{doctor.specialty}</Td>
                  <Td>{doctor.department}</Td>
                  <Td>{doctor.experienceYears} yrs</Td>
                  <Td>{doctor.consultationFee}</Td>
                  <Td>
                    <Badge
                      variant={statusBadgeVariant(doctor.availabilityStatus)}
                    >
                      {doctor.availabilityStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(doctor)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(doctor);
                          setCreating(false);
                          setFormError(null);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(doctor)}
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
                title="No doctors found"
                description="Adjust filters or add a new clinician to the demo directory."
              />
            ) : null}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((doctor) => (
            <Card key={doctor.id}>
              <CardBody>
                <div className="flex items-center gap-3">
                  <DoctorAvatar doctor={doctor} />
                  <div>
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-secondary">{doctor.specialty}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{doctor.department}</p>
                <p className="mt-1 text-sm text-muted">
                  {doctor.experienceYears} years · {doctor.consultationFee}
                </p>
                <Badge
                  className="mt-2"
                  variant={statusBadgeVariant(doctor.availabilityStatus)}
                >
                  {doctor.availabilityStatus}
                </Badge>
                <div className="mt-4 flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelected(doctor)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(doctor);
                      setCreating(false);
                      setFormError(null);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDelete(doctor)}
                  >
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
          {pageItems.length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-3">
              <EmptyState
                title="No doctors found"
                description="Adjust filters or add a new clinician."
              />
            </div>
          ) : null}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-muted">
          Showing {pageItems.length} of {filtered.length} doctors
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
          setFormError(null);
        }}
        title={editing ? "Edit doctor" : "Add doctor"}
        description="Demo clinician profile — fictional records only."
        className="max-w-3xl"
      >
        {formError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {formError}
          </p>
        ) : null}
        <DoctorForm
          initial={editing}
          departments={departments}
          submitLabel={editing ? "Update doctor" : "Create doctor"}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
            setFormError(null);
          }}
          onSubmit={(input) => {
            if (editing) {
              const result = updateDoctor(editing.id, input);
              if (!result) return;
              if ("error" in result) {
                setFormError(result.error);
                return;
              }
              setToast(`Updated ${result.name}.`);
            } else {
              const result = addDoctor(input);
              if ("error" in result) {
                setFormError(result.error);
                return;
              }
              setToast(`Created ${result.name} (${result.id}).`);
            }
            setCreating(false);
            setEditing(null);
            setFormError(null);
          }}
        />
      </Modal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Doctor profile"}
        description="Demo clinician details — not a real provider record."
        className="max-w-2xl"
      >
        {selected ? <DoctorDetailBody selected={selected} /> : null}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete doctor?"
        message={
          pendingDelete
            ? `Delete ${pendingDelete.name}? Related appointments will be kept and labeled with a deleted-doctor note.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const result = deleteDoctor(pendingDelete.id);
          setToast(result.message);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function DoctorDetailBody({ selected }: { selected: Doctor }) {
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        {selected.imagePreview?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selected.imagePreview}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-light-blue text-lg font-semibold text-primary">
            {selected.imageInitials}
          </div>
        )}
        <div>
          <p className="font-semibold">{selected.specialty}</p>
          <Badge variant={statusBadgeVariant(selected.availabilityStatus)}>
            {selected.availabilityStatus}
          </Badge>
        </div>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {[
          ["Doctor ID", selected.id],
          ["Department", selected.department],
          ["Qualification", selected.qualification],
          ["Experience", `${selected.experienceYears} years`],
          ["Consultation fee", selected.consultationFee],
          ["Schedule", selected.availability],
          ["Phone", selected.phone],
          ["Email", selected.email],
          ["Rating", String(selected.rating)],
          ["Bio", selected.bio],
        ].map(([label, value]) => (
          <div
            key={label}
            className={label === "Bio" ? "sm:col-span-2" : undefined}
          >
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <Link
        href={`/doctors/${selected.id}`}
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        View public profile
      </Link>
    </>
  );
}