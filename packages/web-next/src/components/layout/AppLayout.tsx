"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import FileDetailsSidebar from "@/components/dashboard/FileDetailsSidebar";
import {
  SelectedFileProvider,
  useSelectedFile,
} from "@/contexts/SelectedFileContext";
import { useStorage } from "@/hooks/useStorage";
import { useUser } from "@/hooks/useUser";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

type AppLayoutProps = {
  children: ReactNode;
  breadcrumbs?: string[];
  showDetailsSidebar?: boolean;
};

function AppLayoutContent({
  children,
  breadcrumbs,
  showDetailsSidebar = true,
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
  const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = useState(false);
  const router = useRouter();

  // Auto open sidebar when file is selected
  useEffect(() => {
    if (selectedFile && showDetailsSidebar) {
      setIsDetailsSidebarOpen(true);
    }
  }, [selectedFile, showDetailsSidebar]);

  // Auth check
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, userLoading, router]);

  // ESC key to deselect file and close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDetailsSidebarOpen) {
          setIsDetailsSidebarOpen(false);
        }
        if (selectedFile) {
          setSelectedFile(null);
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isDetailsSidebarOpen, selectedFile, setSelectedFile]);

  if (!userLoading && !user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block">
        {/* normalize storage shape for sidebar */}
        <AppSidebar
          loading={storageLoading}
          storage={
            storage ?? {
              storageUsed,
              storageLimit,
              usagePercentage,
              storageRemaining: storageLimit - storageUsed,
            }
          }
          user={user}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AppHeader breadcrumbs={breadcrumbs} />

        {/* Scrollable Content with Right Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          <main className="relative flex-1 overflow-y-auto">
            {children}


          </main>

          {/* Right Sidebar - File Details - Responsive */}
          {showDetailsSidebar && isDetailsSidebarOpen && (
            <>
              {/* Overlay for mobile/tablet - only on smaller screens */}
              <button
                aria-label="Close sidebar"
                className="fixed inset-0 z-40 bg-black/50 xl:hidden"
                onClick={() => setIsDetailsSidebarOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsDetailsSidebarOpen(false);
                  }
                }}
                type="button"
              />

              {/* Sidebar - slide from right on mobile, inline on xl+ */}
              <div className="fixed top-0 right-0 bottom-0 z-50 xl:relative xl:top-auto xl:bottom-auto xl:z-auto">
                <FileDetailsSidebar
                  isOpen={isDetailsSidebarOpen}
                  onClose={() => setIsDetailsSidebarOpen(false)}
                />
              </div>
            </>
          )}
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
