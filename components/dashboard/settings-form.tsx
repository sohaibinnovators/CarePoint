"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useCarePointStore } from "@/lib/carepoint-store";

export function SettingsForm({
  role,
  defaultName,
  defaultEmail,
  showResetDemo = false,
}: {
  role: string;
  defaultName: string;
  defaultEmail: string;
  showResetDemo?: boolean;
}) {
  const { resetDemoData } = useCarePointStore();
  const [saved, setSaved] = useState(false);
  const [resetToast, setResetToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: defaultName,
    email: defaultEmail,
    phone: "+1 (555) 000-0000",
    timezone: "America/New_York",
    bio: `Demo ${role} profile settings. Changes are not persisted.`,
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.includes("@")) next.email = "Enter a valid email.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSaved(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Profile settings"
          description="UI-only preferences for this demo dashboard."
        />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name" error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Timezone">
                <Select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                >
                  <option>America/New_York</option>
                  <option>America/Chicago</option>
                  <option>America/Los_Angeles</option>
                  <option>UTC</option>
                </Select>
              </Field>
            </div>
            <Field label="Bio">
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">Save changes</Button>
              {saved ? (
                <p className="text-sm text-success">
                  Saved locally in UI state only — nothing was stored.
                </p>
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>

      {showResetDemo ? (
        <Card>
          <CardHeader
            title="Reset demo data"
            description="Restore the seeded fictional clinic dataset in this browser."
          />
          <CardBody className="space-y-3">
            <p className="text-sm text-muted">
              This clears CarePoint localStorage demo records for this browser and
              reloads seed patients, appointments, clinical, and billing data.
            </p>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                resetDemoData();
                setResetToast("Demo data restored from seed.");
              }}
            >
              Reset local demo data
            </Button>
            {resetToast ? (
              <p className="text-sm text-success">{resetToast}</p>
            ) : null}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
