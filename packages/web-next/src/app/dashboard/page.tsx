"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import FileCards from "@/components/dashboard/FileCards";
import FileDetailsSidebar from "@/components/dashboard/FileDetailsSidebar";
import FileTable from "@/components/dashboard/FileTable";

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader breadcrumbs={["My Files", "Secret Folder"]} />

        {/* Scrollable Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 space-y-8 overflow-y-auto p-8">
            <FileCards />
            <FileTable />
          </main>

          {/* Right Sidebar */}
          <FileDetailsSidebar />
        </div>
      </div>
    </div>
  );
}
