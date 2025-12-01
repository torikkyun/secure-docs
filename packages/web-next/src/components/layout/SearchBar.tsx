"use client";

import {
  FileIcon,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { File } from "@/types/api";

type SearchBarProps = {
  query: string;
  setQueryAction: (query: string) => void;
  results: File[];
  resultsOpen: boolean;
  setResultsOpenAction: (open: boolean) => void;
  resultsLoading: boolean;
  searchInputRef: RefObject<HTMLInputElement | null>;
  setShowFiltersAction?: (show: boolean) => void;
  filterActive?: boolean;
};

// Get file type icon helper
const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || "")) {
    return <ImageIcon className="size-5 text-blue-500" />;
  }
  if (["pdf"].includes(ext || "")) {
    return <FileText className="size-5 text-red-500" />;
  }
  if (["doc", "docx", "txt", "md"].includes(ext || "")) {
    return <FileText className="size-5 text-blue-600" />;
  }
  return <FileIcon className="size-5 text-gray-500" />;
};

// Format bytes into human readable string
const formatSize = (size?: number | string) => {
  const n = Number(size) || 0;
  if (n === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = n;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const formatted =
    i === 0
      ? `${Math.round(value)} ${units[i]}`
      : `${Math.round(value * 10) / 10} ${units[i]}`;
  return formatted;
};

export function SearchBar({
  query,
  setQueryAction,
  results,
  resultsOpen,
  setResultsOpenAction,
  resultsLoading,
  searchInputRef,
  setShowFiltersAction,
  filterActive = false,
}: SearchBarProps) {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 z-10 size-5 text-muted-foreground transition-colors" />
        <input
          className="peer h-12 w-full rounded-xl border-2 border-input bg-background/50 pr-14 pl-12 text-sm shadow-sm backdrop-blur-sm transition-all placeholder:text-muted-foreground hover:border-muted-foreground/50 focus:border-primary focus:bg-background focus:shadow-md focus:outline-none"
          onChange={(e) => setQueryAction(e.target.value)}
          placeholder="Search files by name or content..."
          ref={searchInputRef}
          type="text"
          value={query}
        />
        {/* Clear Button (left of filter) */}
        {query && (
          <Button
            className="absolute right-12 size-7 transition-all hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              setQueryAction("");
              setResultsOpenAction(false);
              searchInputRef.current?.focus();
            }}
            size="icon"
            title="Clear search"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        )}

        {/* Filter Toggle Button (rightmost) */}
        {typeof setShowFiltersAction === "function" && (
          <Button
            className={`absolute right-3 size-7 transition-all ${
              filterActive ? "bg-primary/10 text-primary" : "hover:bg-accent/10"
            }`}
            onClick={() => setShowFiltersAction?.(true)}
            size="icon"
            title="Open filters"
            variant="ghost"
          >
            <SlidersHorizontal
              className={`size-4 ${filterActive ? "text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {(resultsOpen || query) && (
        <div className="slide-in-from-top-2 absolute top-full left-0 z-50 mt-3 w-full animate-in overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          {resultsLoading && (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div className="flex items-center gap-3" key={i}>
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!resultsLoading && query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
                <FolderOpen className="size-8 text-muted-foreground" />
              </div>
              <p className="mb-1 font-semibold text-foreground text-sm">
                No files found
              </p>
              <p className="text-muted-foreground text-xs">
                Try adjusting your search or filters
              </p>
            </div>
          )}
          {!resultsLoading && results.length > 0 && (
            <div>
              <div className="border-border border-b bg-muted/30 px-4 py-2">
                <p className="font-medium text-muted-foreground text-xs">
                  Found {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ul className="max-h-[400px] overflow-y-auto">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      className="group flex w-full items-center gap-4 border-border border-b px-4 py-3 text-left transition-all last:border-b-0 hover:bg-accent/50"
                      onClick={() => {
                        setResultsOpenAction(false);
                        setQueryAction("");
                        router.push(`/files/${r.id}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setResultsOpenAction(false);
                          setQueryAction("");
                          router.push(`/files/${r.id}`);
                        }
                      }}
                      tabIndex={0}
                      type="button"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/10 to-primary/5 transition-all group-hover:from-primary/20 group-hover:to-primary/10">
                        {getFileIcon(r.fileName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm transition-colors group-hover:text-primary">
                          {r.fileName}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {formatSize(r.fileSize)}
                          </span>
                          {r.uploadTimestamp && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground text-xs">
                                {new Date(
                                  r.uploadTimestamp
                                ).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              {results.length >= 10 && (
                <div className="border-border border-t bg-muted/30 px-4 py-2 text-center">
                  <p className="text-muted-foreground text-xs">
                    Showing first 10 results. Refine your search for more
                    specific results.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
