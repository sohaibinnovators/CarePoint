"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { SearchFilter } from "@/components/ui/search-filter";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import type { Service, ServiceInput } from "@/lib/types";

const emptyService: ServiceInput = {
  name: "",
  category: "",
  departmentId: "",
  description: "",
  duration: "",
  price: "",
};

export default function AdminServicesPage() {
  const {
    ready,
    services,
    departments,
    addService,
    updateService,
    deleteService,
  } = useCarePointStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceInput>(emptyService);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [services]);

  useEffect(() => {
    if (!editing) {
      setForm(emptyService);
      return;
    }
    setForm({
      name: editing.name,
      category: editing.category,
      departmentId: editing.departmentId ?? "",
      description: editing.description,
      duration: editing.duration,
      price: editing.price,
    });
  }, [editing, creating]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory =
        categoryFilter === "all" || service.category === categoryFilter;
      const matchesSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [services, search, categoryFilter]);

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm(emptyService);
    setErrors({});
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Service name is required.";
    if (!form.category.trim()) next.category = "Category is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.duration.trim()) next.duration = "Duration is required.";
    if (!form.price.trim()) next.price = "Price is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submitForm(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const payload: ServiceInput = {
      ...form,
      departmentId: form.departmentId?.trim() || undefined,
    };
    if (editing) {
      const updated = updateService(editing.id, payload);
      if (updated) setToast(`Updated ${updated.name}.`);
    } else {
      const created = addService(payload);
      setToast(`Created ${created.name} (${created.id}).`);
    }
    setCreating(false);
    setEditing(null);
    setForm(emptyService);
  }

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage the demo clinical services catalog and pricing."
        actions={<Button onClick={openCreate}>Add service</Button>}
      />

      <p className="text-sm text-muted">{clinicInfo.demoNotice}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search services…"
          filter={categoryFilter}
          onFilterChange={setCategoryFilter}
          filterOptions={[
            { label: "All categories", value: "all" },
            ...categories.map((c) => ({ label: c, value: c })),
          ]}
        />
      </div>

      <Card>
        <CardBody className="p-0">
          <Table
            headers={[
              "Service",
              "Category",
              "Department",
              "Duration",
              "Price",
              "Actions",
            ]}
          >
            {filtered.map((service) => (
              <tr key={service.id}>
                <Td>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-muted">{service.description}</p>
                </Td>
                <Td>{service.category}</Td>
                <Td>
                  {service.departmentId
                    ? departments.find((d) => d.id === service.departmentId)
                        ?.name ?? "—"
                    : "—"}
                </Td>
                <Td>{service.duration}</Td>
                <Td className="font-medium text-primary">{service.price}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(service);
                        setCreating(false);
                        setErrors({});
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(service)}
                    >
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          {filtered.length === 0 ? (
            <EmptyState
              title="No services found"
              description="Adjust filters or add a new service."
            />
          ) : null}
        </CardBody>
      </Card>

      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
          setErrors({});
        }}
        title={editing ? "Edit service" : "Add service"}
        description="Demo catalog entry — fictional pricing only."
        className="max-w-2xl"
      >
        <form onSubmit={submitForm} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Service name" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Category" error={errors.category}>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Diagnostics"
              />
            </Field>
            <Field label="Department (optional)">
              <Select
                value={form.departmentId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
              >
                <option value="">None</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Duration" error={errors.duration}>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="30 min"
              />
            </Field>
            <Field label="Demo price" error={errors.price}>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="$85"
              />
            </Field>
          </div>
          <Field label="Description" error={errors.description}>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">
              {editing ? "Update service" : "Create service"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete service?"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.name} from the demo catalog?`
            : ""
        }
        confirmLabel="Delete"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const result = deleteService(pendingDelete.id);
          setToast(result.message);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}