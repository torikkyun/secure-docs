"use client";

import { FolderOpen, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import getFileIcon from "@/lib/getFileIcon";
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
        <Search className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 text-gray-600 dark:text-gray-400 transition-colors -translate-y-1/2" />
        <input
          className="peer h-12 w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pr-14 pl-12 text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all hover:border-gray-300 dark:hover:border-neutral-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          onChange={(e) => setQueryAction(e.target.value)}
          placeholder="Tìm kiếm tệp theo tên hoặc nội dung..."
          ref={searchInputRef}
          type="text"
          value={query}
        />
        {/* Clear Button (left of filter) */}
        {query && (
          <Button
            className="absolute right-12 size-7 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => {
              setQueryAction("");
              setResultsOpenAction(false);
              searchInputRef.current?.focus();
            }}
            size="icon"
            title="Xóa tìm kiếm"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        )}

        {/* Filter Toggle Button (rightmost) */}
        {typeof setShowFiltersAction === "function" && (
          <Button
            className={`absolute right-3 size-7 transition-all ${
              filterActive 
                ? "bg-black dark:bg-white text-white dark:text-black" 
                : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
            onClick={() => setShowFiltersAction?.(true)}
            size="icon"
            title="Mở bộ lọc"
            variant="ghost"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {(resultsOpen || query) && (
        <div className="absolute top-full left-0 z-50 mt-3 w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden animate-in slide-in-from-top-2">
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
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
                <FolderOpen className="size-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="mb-1 font-semibold text-black dark:text-white text-sm">
                Không tìm thấy tệp
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Thử điều chỉnh tìm kiếm hoặc bộ lọc
              </p>
            </div>
          )}
          {!resultsLoading && results.length > 0 && (
            <div>
              <div className="border-gray-200 dark:border-neutral-700 border-b bg-gray-50 dark:bg-neutral-800/50 px-4 py-2">
                <p className="font-medium text-gray-600 dark:text-gray-400 text-xs">
                  Tìm thấy {results.length} kết quả{results.length !== 1 ? "" : ""}
                </p>
              </div>
              <ul className="max-h-[400px] overflow-y-auto">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      className="group flex w-full items-center gap-4 border-gray-200 dark:border-neutral-700 border-b px-4 py-3 text-left transition-all last:border-b-0 hover:bg-gray-50 dark:hover:bg-neutral-800/50"
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
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800 transition-all group-hover:bg-gray-200 dark:group-hover:bg-neutral-700">
                        {getFileIcon(r.fileName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-black dark:text-white text-sm transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-400">
                          {r.fileName}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400 text-xs">
                            {formatSize(r.fileSize)}
                          </span>
                          {r.uploadTimestamp && (
                            <>
                              <span className="text-gray-400 dark:text-gray-600">•</span>
                              <span className="text-gray-600 dark:text-gray-400 text-xs">
                                {new Date(
                                  r.uploadTimestamp
                                ).toLocaleDateString("vi-VN")}
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
                <div className="border-gray-200 dark:border-neutral-700 border-t bg-gray-50 dark:bg-neutral-800/50 px-4 py-2 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Hiển thị 10 kết quả đầu tiên. Tinh chỉnh tìm kiếm để có kết quả chính xác hơn.
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
