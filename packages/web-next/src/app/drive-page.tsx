"use client";

import { ArrowUpDown, ChevronRight, Filter, Grid, List } from "lucide-react";
import FileGrid from "@/components/drive/FileGrid";
import Navbar from "@/components/drive/Navbar";
import Sidebar from "@/components/drive/Sidebar";
import { Button } from "@/components/ui/button";
import { useDrive } from "@/contexts/DriveContext";
import { cn } from "@/lib/utils";

export default function DrivePage() {
  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentFolder,
  } = useDrive();

  const toggleSort = () => {
    if (sortBy === "modified") {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy("modified");
      setSortOrder("desc");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-8 py-6">
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="mb-4 flex items-center gap-2 text-gray-500 text-sm">
              <span className="cursor-pointer font-medium transition-colors hover:text-blue-600">
                Drive
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-blue-600">{currentFolder}</span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-2xl text-gray-900 tracking-tight">
                {currentFolder}
              </h2>
              <div className="flex items-center gap-4">
                <Button
                  className={cn(
                    "font-medium text-gray-700 transition-all hover:bg-blue-50",
                    sortBy === "modified" && "bg-blue-50 text-blue-700"
                  )}
                  onClick={toggleSort}
                  size="sm"
                  variant="ghost"
                >
                  <ArrowUpDown
                    className={cn(
                      "mr-2 h-4 w-4 transition-transform duration-200",
                      sortOrder === "desc" && "rotate-180 transform"
                    )}
                  />
                  Last modified
                </Button>
                <Button
                  className="font-medium text-gray-700 transition-all hover:bg-blue-50"
                  size="sm"
                  variant="ghost"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <Button
                    className={cn(
                      "h-9 w-9 rounded-none transition-all hover:bg-blue-50",
                      viewMode === "list" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setViewMode("list")}
                    size="icon"
                    variant="ghost"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    className={cn(
                      "h-9 w-9 rounded-none border-gray-200 border-l transition-all hover:bg-blue-50",
                      viewMode === "grid" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setViewMode("grid")}
                    size="icon"
                    variant="ghost"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <FileGrid />
        </main>
      </div>
    </div>
  );
}
