"use client";

import { AdminLoading } from "@/components/admin/AdminLoading";
import { FilesTable } from "@/components/admin/FilesTable";
import AppLayout from "@/components/layout/AppLayout";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useAdminFiles } from "@/hooks/admin/useAdminFiles";

export default function AdminFilesPage() {
  const { isLoading: authLoading, getToken } = useAdminAuth();
  const token = getToken();

  const { files, total, loading } = useAdminFiles(token);

  const isLoading = authLoading || loading;

  if (isLoading) {
    return (
      <AdminLoading
        breadcrumbs={["Admin", "Files"]}
        description="Loading files..."
        title="All Files"
      />
    );
  }

  return (
    <AppLayout
      breadcrumbs={["Admin", "Files"]}
      description={`${total} files in system`}
      showDetailsSidebar={false}
      title="All Files"
      variant="admin"
    >
      <div className="space-y-4 p-4 md:p-6 lg:p-8">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-6">
            <h2 className="font-semibold text-lg">System Files</h2>
            <p className="text-muted-foreground text-sm">
              View all files uploaded by users
            </p>
          </div>

          <div className="p-6">
            {files.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No files found</p>
              </div>
            ) : (
              <FilesTable files={files} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
