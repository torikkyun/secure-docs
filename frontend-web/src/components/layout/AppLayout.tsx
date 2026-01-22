"use client";

import { useEffect } from "react";
import UnifiedDetailsSidebar from "@/components/dashboard/UnifiedDetailsSidebar";
import {
  SelectedFileProvider,
  useSelectedFile,
} from "@/contexts/SelectedFileContext";
import { useUnifiedSidebar } from "@/contexts/UnifiedSidebarContext";
import { useStorage } from "@/hooks/useStorage";
import { useUser } from "@/hooks/useUser";
import AdminSidebar from "./AdminSidebar";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

type AppLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: string[];
  showDetailsSidebar?: boolean;
  variant?: "user" | "admin"; // Add variant to switch between user and admin layouts
};

function AppLayoutContent({
  children,
  title,
  description,
  breadcrumbs,
  showDetailsSidebar = true,
  variant = "user", // Default to user layout
}: AppLayoutProps) {
  const {
    storage,
    storageUsed,
    storageLimit,
    usagePercentage,
    isLoading: storageLoading,
  } = useStorage();
  const { user, loading: userLoading } = useUser();
  const { selectedFile, setSelectedFile } = useSelectedFile();
  const {
    isOpen: isSidebarOpen,
    showFileDetails,
    closeSidebar,
  } = useUnifiedSidebar();

  // Auto open sidebar when file is selected
  useEffect(() => {
    if (selectedFile && showDetailsSidebar) {
      showFileDetails(selectedFile);
    }
  }, [selectedFile, showDetailsSidebar, showFileDetails]);

  // ESC key to close sidebar and deselect file
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSidebarOpen) {
          closeSidebar();
        }
        if (selectedFile) {
          setSelectedFile(null);
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen, selectedFile, setSelectedFile, closeSidebar]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block">
        {variant === "admin" ? (
          <AdminSidebar />
        ) : (
          /* normalize storage shape for sidebar */
          <AppSidebar
            loading={storageLoading}
            storage={
              storage ?? {
                storageUsed,
                storageLimit,
                storageRemaining: Math.max(storageLimit - storageUsed, 0),
                usagePercentage,
              }
            }
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AppHeader
          breadcrumbs={breadcrumbs}
          description={description}
          loading={userLoading}
          title={title}
          user={user}
        />

        {/* Scrollable Content with Right Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          <main className="relative flex-1 overflow-y-auto">{children}</main>

          {/* Right Sidebar - Unified Details - Responsive */}
          {showDetailsSidebar && isSidebarOpen && <UnifiedDetailsSidebar />}
        </div>
      </div>
    </div>
  );
}

export default function AppLayout(props: AppLayoutProps) {
  return (
    <SelectedFileProvider>
      <AppLayoutContent {...props} />
    </SelectedFileProvider>
  );
}
