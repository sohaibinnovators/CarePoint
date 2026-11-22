"use client";

import { useState } from "react";
import { PatientForm } from "@/components/management/patient-form";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import type { Patient } from "@/lib/types";

export default function ReceptionistRegisterPage() {
  const { ready, addPatient } = useCarePointStore();
  const [created, setCreated] = useState<Patient | null>(null);

  if (!ready) return <StoreLoading />;

  if (created) {
    return (
      <>
        <PageHeader
          title="Register Patient"
          description="Patient saved to the demo registry in this browser."
        />
        <Card>
          <CardBody className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Registration complete
            </h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-foreground">{created.name}</span>{" "}
              was added with patient ID{" "}
              <span className="font-mono text-foreground">{created.id}</span>.
            </p>
            <p className="mt-2 text-xs text-muted">{clinicInfo.demoNotice}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setCreated(null)}
            >
              Register another
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Register Patient"
        description="Capture new patient details. Records persist in localStorage for this demo."
      />

      <Card>
        <CardHeader
          title="New patient form"
          description={clinicInfo.demoNotice}
        />
        <CardBody>
          <PatientForm
            key="register-new"
            mode="front-desk"
            submitLabel="Complete registration"
            onSubmit={(input) => {
              const patient = addPatient(input);
              setCreated(patient);
            }}
          />
        </CardBody>
      </Card>
    </>
  );
}