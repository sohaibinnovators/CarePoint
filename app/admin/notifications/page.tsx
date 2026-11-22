import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { PageHeader } from "@/components/layout/dashboard-shell";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Demo alerts for scheduling, billing, and staff updates."
      />
      <NotificationsPanel />
    </div>
  );
}
