"use client";

import { AdminLoading } from "@/components/admin/AdminLoading";
import { RecentUsersTable } from "@/components/admin/RecentUsersTable";
import { StatsCards } from "@/components/admin/StatsCards";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";

export default function AdminDashboardPage() {
  const { isLoading: authLoading, getToken } = useAdminAuth();
  const token = getToken() || "";

  const { stats, loading: statsLoading } = useAdminStats(token);
  const { users, loading: usersLoading } = useAdminUsers(token, 10);

  const isLoading = authLoading || statsLoading || usersLoading;

  if (isLoading) {
    return (
      <AdminLoading
        breadcrumbs={["Admin", "Dashboard"]}
        description="Loading..."
        title="Admin Dashboard"
      />
    );
  }

  return (
    <AppLayout
      breadcrumbs={["Admin", "Dashboard"]}
      description="Secure Docs System Management"
      showDetailsSidebar={false}
      title="Admin Dashboard"
      variant="admin"
    >
      <div className="p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Stats Cards */}
          {stats && <StatsCards stats={stats} />}

          {/* Recent Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentUsersTable users={users} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
