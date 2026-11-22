import { PageHeader } from "@/components/layout/dashboard-shell";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default function DoctorSettingsPage() {
  return (
    <>
      <PageHeader
        title="Profile Settings"
        description="Update your demo doctor profile (UI only)."
      />
      <SettingsForm
        role="Doctor"
        defaultName="Dr. Elena Hayes"
        defaultEmail="elena.hayes@carepoint.demo"
      />
    </>
  );
}