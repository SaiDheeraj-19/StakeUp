import { AdminStats } from "@/features/admin/components/AdminStats";
import { AdminUsersTable } from "@/features/admin/components/AdminUsersTable";

export const metadata = {
  title: 'Admin Console | StakeUp',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Platform Overview</h2>
        <p className="text-zinc-500">Real-time telemetry and user management.</p>
      </div>
      
      <AdminStats />
      
      <AdminUsersTable />
    </div>
  );
}
