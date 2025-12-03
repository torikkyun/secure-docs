"use client";

import FileTable from "@/components/dashboard/FileTable";
import StatsCards from "@/components/dashboard/StatsCards";
import AppLayout from "@/components/layout/AppLayout";
import { useDashboardStats, useRecentFiles } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { files, loading: filesLoading, refetch } = useRecentFiles();

  return (
    <AppLayout breadcrumbs={["Dashboard"]}>
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <StatsCards loading={statsLoading} stats={stats} />
        <FileTable
          files={files}
          loading={filesLoading}
          onFileDeletedAction={refetch}
        />
      </div>
    </AppLayout>
  );
}
