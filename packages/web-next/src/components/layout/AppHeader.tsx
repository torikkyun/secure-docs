"use client";

import { ChevronRight, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { fileApi, userApi } from "@/lib/api";
import type { File, User } from "@/types/api";
import { FilterPanel } from "./FilterPanel";
import { SearchBar } from "./SearchBar";

type AppHeaderProps = {
  title?: string;
  breadcrumbs?: string[];
  user?: User | null;
  loading?: boolean;
};

export default function AppHeader({
  breadcrumbs = ["Dashboard"],
  user,
  loading,
}: AppHeaderProps) {
  const [localUser, setLocalUser] = useState<User | null | undefined>(user);
  const [localLoading, setLocalLoading] = useState<boolean>(!!loading || !user);

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
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const initials = localUser?.username
    ? localUser.username.substring(0, 2).toUpperCase()
    : "";
  const avatarUrl = (localUser as unknown as { avatarUrl?: string })?.avatarUrl;

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
    if (user) {
      setLocalUser(user);
      setLocalLoading(false);
      return;
    }

    let mounted = true;
    setLocalLoading(true);
    userApi
      .getProfile()
      .then((u) => {
        if (mounted) {
          setLocalUser(u);
        }
      })
      .catch(() => {
        if (mounted) {
          setLocalUser(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLocalLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user]);

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
    <div className="border-border border-b bg-card px-8 py-6">
      <div className="flex items-center justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div className="flex items-center gap-2" key={crumb}>
              {index > 0 && (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "font-semibold text-foreground"
                    : "cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>

        {/* User Profile */}
        {localLoading && (
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        )}
        {!localLoading && localUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-auto gap-3 px-2.5 py-1.5 hover:bg-accent"
                variant="ghost"
              >
                <div className="hidden text-right md:block">
                  <p className="font-semibold text-foreground text-sm leading-tight">
                    {localUser.username}
                  </p>
                  <p className="text-muted-foreground text-xs capitalize">
                    {localUser.role?.name}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary to-primary/60">
                  <span className="font-bold text-base text-primary-foreground">
                    {initials}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0">
                    {avatarUrl ? (
                      <Image
                        alt={localUser?.username || "avatar"}
                        className="size-full rounded-full object-cover"
                        height={48}
                        src={avatarUrl}
                        width={48}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary to-primary/60">
                        <span className="font-bold text-base text-primary-foreground">
                          {initials}
                        </span>
                      </div>
                    )}
                    <div className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-background bg-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground text-sm">
                      {localUser.username}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {localUser.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-muted/50 px-3 py-2">
                  <p className="font-medium text-muted-foreground text-xs">
                    Wallet Address
                  </p>
                  <p className="mt-0.5 font-mono text-foreground text-xs">
                    {localUser.walletAddress.substring(0, 8)}...
                    {localUser.walletAddress.substring(34)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => {
                  // Clear token and redirect to login
                  try {
                    localStorage.removeItem("auth_token");
                  } catch {
                    /* ignore */
                  }
                  router.push("/auth/login");
                }}
              >
                <LogOut className="mr-2 size-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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
