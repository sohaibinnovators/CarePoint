import Link from "next/link";
import { LoginForm } from "@/components/forms/auth-forms";
import { Card, CardBody } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Demo login only — choose a role and continue to its dashboard UI.
        </p>
      </div>
      <Card>
        <CardBody>
          <LoginForm />
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-sm text-muted">
        Or jump directly:{" "}
        <Link href="/admin" className="text-primary hover:underline">
          Admin
        </Link>
        {" · "}
        <Link href="/doctor" className="text-primary hover:underline">
          Doctor
        </Link>
        {" · "}
        <Link href="/receptionist" className="text-primary hover:underline">
          Reception
        </Link>
        {" · "}
        <Link href="/patient" className="text-primary hover:underline">
          Patient
        </Link>
      </p>
    </div>
  );
}
