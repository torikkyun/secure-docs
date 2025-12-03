"use client";

import {
  Clock,
  FileText,
  HardDrive,
  Home,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { userApi } from "@/lib/api";
import type { StorageInfo, User } from "@/types/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, badge: null },
  { href: "/files", label: "My Files", icon: FileText, badge: null },
  { href: "/shares", label: "Shares", icon: Users, badge: null },
  { href: "/downloads", label: "Downloads", icon: Clock, badge: null },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

type AppSidebarProps = {
  storage?: StorageInfo | null;
  loading?: boolean;
  user?: User | null;
};

export default function AppSidebar({ storage, loading, user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [localUser, setLocalUser] = useState<User | null | undefined>(user);
  const [userLoading, setUserLoading] = useState<boolean>(!!loading || !user);

  // Safe derived values
  const used = storage?.storageUsed ?? 0;
  const limit = storage?.storageLimit ?? 0;
  let percentage = 0;
  if (storage && typeof storage.usagePercentage === "number") {
    percentage = storage.usagePercentage;
  } else if (limit > 0) {
    percentage = Math.round((used / limit) * 100);
  }

  const initials = localUser?.username
    ? localUser.username.substring(0, 2).toUpperCase()
    : "";

  useEffect(() => {
    if (user) {
      setLocalUser(user);
      setUserLoading(false);
      return;
    }

    let mounted = true;
    setUserLoading(true);
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
          setUserLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <aside className="flex h-screen w-[280px] flex-col border-gray-200 dark:border-neutral-800 border-r bg-white dark:bg-neutral-900">
      {/* Logo Section */}
      <div className="border-gray-200 dark:border-neutral-800 border-b px-6 py-6">
        <Link className="flex items-center gap-3" href="/dashboard">
          <div className="flex size-10 items-center justify-center rounded-xl bg-black dark:bg-white">
            <Shield className="size-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="font-bold text-black dark:text-white text-lg leading-none">
              SecureDocs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Blockchain Storage</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-sm transition-colors",
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== null && (
                <Badge
                  className="bg-black text-white dark:bg-white dark:text-black"
                  variant="secondary"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        <div className="mt-4 border-gray-200 dark:border-neutral-800 border-t pt-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-sm transition-colors",
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white"
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Storage Used Section */}
      <div className="flex flex-1 flex-col justify-between px-3">
        <div className="px-3">
          <div className="mt-4 border-gray-200 dark:border-neutral-800 border-t px-4 py-4">
            {loading && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            )}
            {!loading && (
              <div className="mt-4 space-y-3">
                {/* Header with Icon */}
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800">
                    <HardDrive className="size-5 text-black dark:text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-600 dark:text-gray-400 text-xs">
                      Storage Used
                    </p>
                    <p className="font-bold text-base text-black dark:text-white leading-tight">
                      {formatBytes(used)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <Progress className="h-2" value={percentage} />
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {formatBytes(limit)} total
                    </p>
                    <p className="font-medium text-black dark:text-white text-xs">
                      {Math.round(percentage)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="px-3 pb-4">
          <div className="border-gray-200 dark:border-neutral-800 border-t px-4 py-4">
            {userLoading && (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            )}
            {!userLoading && localUser && (
              <div className="space-y-3">
                {/* User Info */}
                <div className="rounded-lg bg-gray-100 dark:bg-neutral-800 p-3">
                  <p className="font-semibold text-black dark:text-white text-sm truncate">
                    {localUser.username}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {localUser.email}
                  </p>
                </div>
                {/* Action Buttons */}
                <button
                  onClick={() => router.push("/settings")}
                  className="flex w-full items-center gap-2 rounded-lg bg-gray-100 dark:bg-neutral-800 px-3 py-2.5 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white font-semibold text-sm transition-colors"
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    try {
                      localStorage.removeItem("auth_token");
                    } catch {
                      /* ignore */
                    }
                    router.push("/auth/login");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg bg-gray-100 dark:bg-neutral-800 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold text-sm transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
