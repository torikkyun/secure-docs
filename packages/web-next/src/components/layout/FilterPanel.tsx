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
      className="slide-in-from-top-2 absolute top-full right-0 z-50 mt-3 w-80 animate-in rounded-xl border border-border bg-card p-4 shadow-xl"
      ref={panelRef}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">
          Filter Options
        </h3>
        <Button
          className="size-6"
          onClick={() => setShowFiltersAction(false)}
          size="icon"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Filter Type */}
      <div className="mb-4 space-y-2">
        <label
          className="block font-medium text-muted-foreground text-xs uppercase tracking-wide"
          htmlFor="filter-type-select"
        >
          File Source
        </label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            className={`h-9 transition-all ${
              selectedType === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border"
            }`}
            onClick={() => setSelectedType("all")}
            variant="outline"
          >
            All
          </Button>
          <Button
            className={`h-9 transition-all ${
              selectedType === "uploaded"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border"
            }`}
            onClick={() => setSelectedType("uploaded")}
            variant="outline"
          >
            Uploaded
          </Button>
          <Button
            className={`h-9 transition-all ${
              selectedType === "received"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border"
            }`}
            onClick={() => setSelectedType("received")}
            variant="outline"
          >
            Received
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 border-border border-t pt-3">
        <Button
          className="flex-1"
          onClick={() => {
            setSelectedType("all");
            // do not apply to parent until user clicks Apply
            setShowFiltersAction(false);
            onResetAction();
          }}
          variant="outline"
        >
          Reset
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            // apply selection to parent then trigger parent apply handler
            setFilterTypeAction(selectedType);
            onApplyAction(selectedType);
            setShowFiltersAction(false);
          }}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
