import { PageHeader } from "@/components/layout/dashboard-shell";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { clinicInfo } from "@/lib/mock-data";

export default function DoctorNotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Clinic alerts and demo activity feed."
      />
      <NotificationsPanel />
      <p className="mt-4 text-xs text-muted">{clinicInfo.demoNotice}</p>
    </>
  );
}