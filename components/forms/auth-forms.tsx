"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";

export function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!email.includes("@")) next.email = "Enter a valid email.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    const href =
      role === "admin"
        ? "/admin"
        : role === "doctor"
          ? "/doctor"
          : role === "receptionist"
            ? "/receptionist"
            : "/patient";
    return (
      <div className="rounded-xl border border-border bg-light-blue p-6 text-center">
        <h3 className="text-lg font-semibold">Demo login ready</h3>
        <p className="mt-2 text-sm text-muted">
          No credentials were verified. Continue to the {role} dashboard UI.
        </p>
        <Link href={href} className="mt-4 inline-block">
          <Button>Open {role} dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Role (demo)" error={errors.role}>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="receptionist">Receptionist</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>
      <Field label="Email" error={errors.email}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.includes("@")) next.email = "Enter a valid email.";
    if (form.password.length < 6) next.password = "Use at least 6 characters.";
    if (form.password !== form.confirm) next.confirm = "Passwords must match.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-light-blue p-6 text-center">
        <h3 className="text-lg font-semibold">Account created (Demo)</h3>
        <p className="mt-2 text-sm text-muted">
          No account was stored. You can explore the patient dashboard UI.
        </p>
        <Link href="/patient" className="mt-4 inline-block">
          <Button>Open patient dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Full name" error={errors.name}>
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
      <Field label="Password" error={errors.password}>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </Field>
      <Field label="Confirm password" error={errors.confirm}>
        <Input
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
      </Field>
      <Button type="submit" className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
