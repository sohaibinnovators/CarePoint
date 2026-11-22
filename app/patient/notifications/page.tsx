import { PageHeader } from "@/components/layout/dashboard-shell";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { clinicInfo } from "@/lib/mock-data";

export default function PatientNotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Reminders and clinic updates (demo feed)."
      />
      <NotificationsPanel />
      <p className="mt-4 text-xs text-muted">{clinicInfo.demoNotice}</p>
    </>
  );
}