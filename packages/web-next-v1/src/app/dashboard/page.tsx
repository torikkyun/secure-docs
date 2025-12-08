"use client";

import { useState } from "react";
import FileTable from "@/components/dashboard/FileTable";
import StatsCards from "@/components/dashboard/StatsCards";
import AppLayout from "@/components/layout/AppLayout";
import { ShareFileDialog } from "@/components/ShareFileDialog";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useDashboardStats, useRecentFiles } from "@/hooks/useDashboard";
import type { File as FileType } from "@/types/api";

export default function DashboardPage() {
  // Protect route - redirect to login if not authenticated
  useAuthGuard();

  const { stats, loading: statsLoading } = useDashboardStats();
  const { files, loading: filesLoading, refetch } = useRecentFiles();

  // Share state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<FileType | null>(null);

  const handleShareFile = (file: FileType) => {
    setFileToShare(file);
    setIsShareDialogOpen(true);
  };

  const handleShareSuccess = () => {
    refetch();
  };

  return (
    <AppLayout
      breadcrumbs={["Dashboard"]}
      description="Overview of your files and activity"
      title="Dashboard"
    >
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <StatsCards loading={statsLoading} stats={stats} />
        <FileTable
          files={files}
          loading={filesLoading}
          onFileDeletedAction={refetch}
          onShareAction={handleShareFile}
        />
      </div>

      {/* Share Dialog */}
      <ShareFileDialog
        file={fileToShare}
        isOpen={isShareDialogOpen}
        onCloseAction={() => {
          setIsShareDialogOpen(false);
          setFileToShare(null);
        }}
        onSuccessAction={handleShareSuccess}
      />
    </AppLayout>
  );
}
