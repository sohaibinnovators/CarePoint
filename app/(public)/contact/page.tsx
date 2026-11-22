"use client";

import { useState } from "react";
import { ClinicMap } from "@/components/media/clinic-map";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { clinicInfo } from "@/lib/mock-data";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.includes("@")) next.email = "Enter a valid email.";
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (!form.message.trim()) next.message = "Message is required.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold text-primary">Get in touch</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-3 max-w-2xl text-muted">{clinicInfo.demoNotice}</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            {sent ? (
              <div className="rounded-xl bg-emerald-50 p-6 text-center">
                <h2 className="text-lg font-semibold">Message sent (Demo)</h2>
                <p className="mt-2 text-sm text-muted">
                  Nothing was emailed or stored. This confirms UI validation only.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => setSent(false)}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <Field label="Name" error={errors.name}>
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
                <Field label="Subject" error={errors.subject}>
                  <Input
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                  />
                </Field>
                <Field label="Message" error={errors.message}>
                  <Textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </Field>
                <Button type="submit">Send message</Button>
              </form>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-2 text-sm">
              <h2 className="text-lg font-semibold">Clinic details</h2>
              <p>{clinicInfo.address}</p>
              <p>{clinicInfo.phone}</p>
              <p>{clinicInfo.email}</p>
              <p className="text-muted">{clinicInfo.hours}</p>
            </CardBody>
          </Card>
          <ClinicMap heightClass="min-h-64" />
        </div>
      </div>
    </div>
  );
}
