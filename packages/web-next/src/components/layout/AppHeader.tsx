"use client";

import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { fileApi } from "@/lib/api";
import type { File } from "@/types/api";
import { FilterPanel } from "./FilterPanel";
import { SearchBar } from "./SearchBar";

type AppHeaderProps = {
  title?: string;
  breadcrumbs?: string[];
};

export default function AppHeader({
  breadcrumbs = ["Dashboard"],
}: AppHeaderProps) {
  // Search state
  const [query, setQuery] = useState("");
  const debounceRef = useRef<number | null>(null);
  const [results, setResults] = useState<File[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "uploaded" | "received">(
    "uploaded"
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(
    (searchQuery: string, overrideType?: "all" | "uploaded" | "received") => {
      setResultsLoading(true);
      const params: { [k: string]: unknown } = {
        page: 1,
        limit: 10,
        sort: "-uploadTimestamp",
        search: searchQuery,
      };
      const typeToUse = overrideType ?? filterType;
      if (typeToUse && typeToUse !== "all") {
        params.type = typeToUse;
      }

      return fileApi
        .findAll(params)
        .then((res) => {
          const items = res.files || [];
          setResults(items);
          setResultsOpen(true);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setResults([]);
          setResultsOpen(true);
        })
        .finally(() => setResultsLoading(false));
    },
    [filterType]
  );

  useEffect(() => {
    // debounce search
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!query) {
      setResultsOpen(false);
      setResults([]);
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch]);

  return (
    <div className="border-gray-200 dark:border-neutral-800 border-b bg-white dark:bg-neutral-900 p-3">
      {/* Search Bar with Filters */}
      <div className="relative mt-4">
        <SearchBar
          filterActive={filterType !== "all"}
          query={query}
          results={results}
          resultsLoading={resultsLoading}
          resultsOpen={resultsOpen}
          searchInputRef={searchInputRef}
          setQueryAction={setQuery}
          setResultsOpenAction={setResultsOpen}
          setShowFiltersAction={setShowFilters}
        />
        <FilterPanel
          filterType={filterType}
          onApplyAction={(applied) => {
            if (applied) {
              setFilterType(applied);
            }
            if (query) {
              performSearch(query, applied);
            }
            setShowFilters(false);
          }}
          onResetAction={() => {
            // Reset only closes the panel and clears the panel selection.
            // The actual filter in the parent is only updated when Apply is clicked.
          }}
          setFilterTypeAction={setFilterType}
          setShowFiltersAction={setShowFilters}
          showFilters={showFilters}
        />
      </div>
    </div>
  );
}
