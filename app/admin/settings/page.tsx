import { SettingsForm } from "@/components/dashboard/settings-form";
import { PageHeader } from "@/components/layout/dashboard-shell";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Profile preferences for the demo admin account."
      />
      <SettingsForm
        role="Admin"
        defaultName="Priya Nair"
        defaultEmail="priya.nair@carepoint.demo"
        showResetDemo
      />
    </div>
  );
}
