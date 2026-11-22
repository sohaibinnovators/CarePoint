import { PageHeader } from "@/components/layout/dashboard-shell";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default function ReceptionistSettingsPage() {
  return (
    <>
      <PageHeader
        title="Profile Settings"
        description="Demo receptionist profile preferences."
      />
      <SettingsForm
        role="Receptionist"
        defaultName="Daniel Ruiz"
        defaultEmail="daniel.ruiz@carepoint.demo"
      />
    </>
  );
}