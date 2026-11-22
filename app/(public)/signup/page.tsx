import { SignupForm } from "@/components/forms/auth-forms";
import { Card, CardBody } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-2 text-sm text-muted">
          UI-only registration. No account is stored or authenticated.
        </p>
      </div>
      <Card>
        <CardBody>
          <SignupForm />
        </CardBody>
      </Card>
    </div>
  );
}
