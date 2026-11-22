import { PageHeader } from "@/components/layout/dashboard-shell";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { clinicInfo } from "@/lib/mock-data";

export default function ReceptionistNotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Front desk alerts and demo messages."
      />
      <NotificationsPanel />
      <p className="mt-4 text-xs text-muted">{clinicInfo.demoNotice}</p>
    </>
  );
}