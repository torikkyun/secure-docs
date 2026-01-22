"use client";

import { AdminLoading } from "@/components/admin/AdminLoading";
import { UsersTable } from "@/components/admin/UsersTable";
import AppLayout from "@/components/layout/AppLayout";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";

export default function AdminUsersPage() {
  const { isLoading: authLoading, getToken } = useAdminAuth();
  const token = getToken();

  const { users, total, loading, toggleUserStatus } = useAdminUsers(token);

  const isLoading = authLoading || loading;

  if (isLoading) {
    return (
      <AdminLoading
        breadcrumbs={["Admin", "Users"]}
        description="Loading users..."
        title="All Users"
      />
    );
  }

  return (
    <AppLayout
      breadcrumbs={["Admin", "Users"]}
      description={`${total} users in system`}
      showDetailsSidebar={false}
      title="All Users"
      variant="admin"
    >
      <div className="space-y-4 p-4 md:p-6 lg:p-8">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-6">
            <h2 className="font-semibold text-lg">System Users</h2>
            <p className="text-muted-foreground text-sm">
              Manage all registered users
            </p>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <UsersTable onToggleStatus={toggleUserStatus} users={users} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
