import { PageHeader } from "@/components/layout/dashboard-shell";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default function PatientSettingsPage() {
  return (
    <>
      <PageHeader
        title="Profile Settings"
        description="Manage your demo patient profile."
      />
      <SettingsForm
        role="Patient"
        defaultName="Ava Thompson"
        defaultEmail="ava.thompson@demo.mail"
      />
    </>
  );
}