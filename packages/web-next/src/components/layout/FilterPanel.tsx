"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type FilterPanelProps = {
  showFilters: boolean;
  setShowFiltersAction: (show: boolean) => void;
  filterType: "all" | "uploaded" | "received";
  setFilterTypeAction: (type: "all" | "uploaded" | "received") => void;
  onApplyAction: (applied?: "all" | "uploaded" | "received") => void;
  onResetAction: () => void;
};

export function FilterPanel({
  showFilters,
  setShowFiltersAction,
  filterType,
  setFilterTypeAction,
  onApplyAction,
  onResetAction,
}: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [selectedType, setSelectedType] = useState<
    "all" | "uploaded" | "received"
  >(filterType);

  useEffect(() => {
    if (showFilters) {
      setSelectedType(filterType);
    }
  }, [showFilters, filterType]);

  useEffect(() => {
    if (!showFilters) {
      return;
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowFiltersAction(false);
      }
    }

    function onClick(e: MouseEvent) {
      const el = panelRef.current;
      if (!el) {
        return;
      }
      if (e.target instanceof Node && !el.contains(e.target)) {
        setShowFiltersAction(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [showFilters, setShowFiltersAction]);

  if (!showFilters) {
    return null;
  }

  return (
    <div
      className="absolute top-full right-0 z-50 mt-2 w-72 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-lg animate-in slide-in-from-top-2"
      ref={panelRef}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-black dark:text-white text-sm">
          Tùy chọn lọc
        </h3>
        <Button
          className="size-6 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
          onClick={() => setShowFiltersAction(false)}
          size="icon"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Filter Type */}
      <div className="mb-5 space-y-2.5">
        <label
          className="block font-semibold text-black dark:text-white text-xs uppercase tracking-wide"
          htmlFor="filter-type-select"
        >
          Nguồn tệp
        </label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            className={`h-9 font-medium text-xs transition-all ${selectedType === "all"
                ? "bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white"
                : "border border-gray-200 dark:border-neutral-700 text-black dark:text-white bg-white dark:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-600"
              }`}
            onClick={() => setSelectedType("all")}
            variant="outline"
          >
            Tất cả
          </Button>
          <Button
            className={`h-9 font-medium text-xs transition-all ${selectedType === "uploaded"
                ? "bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white"
                : "border border-gray-200 dark:border-neutral-700 text-black dark:text-white bg-white dark:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-600"
              }`}
            onClick={() => setSelectedType("uploaded")}
            variant="outline"
          >
            Đã tải lên
          </Button>
          <Button
            className={`h-9 font-medium text-xs transition-all ${selectedType === "received"
                ? "bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white"
                : "border border-gray-200 dark:border-neutral-700 text-black dark:text-white bg-white dark:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-600"
              }`}
            onClick={() => setSelectedType("received")}
            variant="outline"
          >
            Nhận được
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 border-t border-gray-200 dark:border-neutral-700 pt-4">
        <Button
          className="flex-1 border border-gray-200 dark:border-neutral-700 text-black dark:text-white bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 font-medium text-sm transition-colors"
          onClick={() => {
            setSelectedType("all");
            setShowFiltersAction(false);
            onResetAction();
          }}
          variant="outline"
        >
          Đặt lại
        </Button>
        <Button
          className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 font-medium text-sm transition-colors"
          onClick={() => {
            setFilterTypeAction(selectedType);
            onApplyAction(selectedType);
            setShowFiltersAction(false);
          }}
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );
}
