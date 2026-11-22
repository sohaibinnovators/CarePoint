"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { DepartmentForm } from "@/components/management/department-form";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { SearchFilter } from "@/components/ui/search-filter";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import type { Department } from "@/lib/types";

export default function AdminDepartmentsPage() {
  const {
    ready,
    departments,
    doctors,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useCarePointStore();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Department | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Department | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return departments.filter(
      (dept) =>
        !q ||
        dept.name.toLowerCase().includes(q) ||
        dept.description.toLowerCase().includes(q) ||
        dept.id.toLowerCase().includes(q),
    );
  }, [departments, search]);

  const doctorsByDept = useMemo(() => {
    const map = new Map<string, typeof doctors>();
    for (const dept of departments) {
      map.set(
        dept.id,
        doctors.filter((d) => d.departmentId === dept.id),
      );
    }
    return map;
  }, [departments, doctors]);

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments / Specialties"
        description="Organize demo specialty groups and see assigned clinicians."
        actions={
          <Button
            onClick={() => {
              setCreating(true);
              setEditing(null);
              setFormError(null);
            }}
          >
            Add department
          </Button>
        }
      />

      <p className="text-sm text-muted">{clinicInfo.demoNotice}</p>
      {toast ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            toast.includes("Cannot")
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {toast}
        </p>
      ) : null}

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments…"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((dept) => {
          const assigned = doctorsByDept.get(dept.id) ?? [];
          const doctorCount = assigned.length;
          return (
            <Card key={dept.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">{dept.name}</h3>
                  <Badge variant="muted">{doctorCount} doctors</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">{dept.description}</p>
                <p className="mt-2 font-mono text-xs text-muted">{dept.id}</p>
                {assigned.length > 0 ? (
                  <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                    {assigned.map((doc) => (
                      <li key={doc.id} className="text-foreground">
                        {doc.name}
                        <span className="text-muted"> · {doc.specialty}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 border-t border-border pt-3 text-sm text-muted">
                    No doctors assigned yet.
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(dept);
                      setCreating(false);
                      setFormError(null);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDelete(dept)}
                  >
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
        {filtered.length === 0 ? (
          <div className="sm:col-span-2 xl:col-span-3">
            <EmptyState
              title="No departments found"
              description="Try a different search or add a new department."
            />
          </div>
        ) : null}
      </div>

      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
          setFormError(null);
        }}
        title={editing ? "Edit department" : "Add department"}
        description="Name and description for this demo specialty group."
        className="max-w-lg"
      >
        <DepartmentForm
          initial={editing}
          error={formError}
          submitLabel={editing ? "Update department" : "Create department"}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
            setFormError(null);
          }}
          onSubmit={(input) => {
            if (editing) {
              const result = updateDepartment(editing.id, input);
              if (!result) return;
              if ("error" in result) {
                setFormError(result.error);
                return;
              }
              setToast(`Updated ${result.name}.`);
            } else {
              const result = addDepartment(input);
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

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete department?"
        message={
          pendingDelete
            ? doctorCountForDept(pendingDelete, doctors) > 0
              ? `Delete ${pendingDelete.name}? This is blocked while doctors are still assigned — the store will reject the delete.`
              : `Delete ${pendingDelete.name}? Related appointments keep a deleted-department label.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const result = deleteDepartment(pendingDelete.id);
          setToast(result.message);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function doctorCountForDept(
  dept: Department,
  doctors: { departmentId: string }[],
) {
  return doctors.filter((d) => d.departmentId === dept.id).length;
}