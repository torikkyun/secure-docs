"use client";

import FileGrid from "@/components/drive/FileGrid";
import Navbar from "@/components/drive/Navbar";
import Sidebar from "@/components/drive/Sidebar";
import { Button } from "@/components/ui/button";
import { useDrive } from "@/contexts/DriveContext";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function StarredPage() {
  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    setCurrentFolder,
  } = useDrive();

  useEffect(() => {
    setCurrentFolder("Starred");
  }, [setCurrentFolder]);

  const toggleSort = () => {
    if (sortBy === "modified") {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy("modified");
      setSortOrder("desc");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6 pb-5 border-b border-neutral-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-4xl text-neutral-900 mb-2">
                  Starred
                </h2>
                <p className="text-neutral-600 text-sm">
                  Files and folders you&apos;ve marked as important
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className={cn(
                    "font-medium text-neutral-700 transition-all hover:bg-neutral-100 rounded-full gap-2",
                    sortBy === "modified" &&
                      "bg-neutral-900 text-white hover:bg-neutral-800"
                  )}
                  onClick={toggleSort}
                  size="sm"
                  variant="ghost"
                >
                  <span
                    className={cn(
                      "material-icons text-base transition-transform duration-200",
                      sortOrder === "desc" && "rotate-180"
                    )}
                  >
                    swap_vert
                  </span>
                  Last modified
                </Button>
                <Button
                  className="font-medium text-neutral-700 transition-all hover:bg-neutral-100 rounded-full gap-2"
                  size="sm"
                  variant="ghost"
                >
                  <span className="material-icons text-base">filter_list</span>
                  Filters
                </Button>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    className={cn(
                      "h-9 w-9 rounded-full transition-all hover:bg-neutral-100",
                      viewMode === "list" &&
                        "bg-neutral-900 text-white hover:bg-neutral-800"
                    )}
                    onClick={() => setViewMode("list")}
                    size="icon"
                    variant="ghost"
                  >
                    <span className="material-icons text-xl">view_list</span>
                  </Button>
                  <Button
                    className={cn(
                      "h-9 w-9 rounded-full transition-all hover:bg-neutral-100",
                      viewMode === "grid" &&
                        "bg-neutral-900 text-white hover:bg-neutral-800"
                    )}
                    onClick={() => setViewMode("grid")}
                    size="icon"
                    variant="ghost"
                  >
                    <span className="material-icons text-xl">grid_view</span>
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
