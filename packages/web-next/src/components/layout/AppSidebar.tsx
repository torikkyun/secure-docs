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
import { userApi } from "@/lib/api";
import { formatBytes } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { StorageInfo, User } from "@/types/api";

const navItems = [
  { href: "/dashboard", label: "Trang chủ", icon: Home, badge: null },
  { href: "/files", label: "Tệp của tôi", icon: FileText, badge: null },
  { href: "/shares", label: "Chia sẻ", icon: Users, badge: null },
  { href: "/downloads", label: "Tải xuống", icon: Clock, badge: null },
];

const bottomNavItems: { href: string; label: string; icon: any }[] = [
  // { href: "/settings", label: "Cài đặt", icon: Settings },
];

type AppSidebarProps = {
  storage?: StorageInfo | null;
  loading?: boolean;
  user?: User | null;
};

export default function AppSidebar({
  storage,
  loading,
  user,
}: AppSidebarProps) {
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
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              Lưu trữ Blockchain
            </p>
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

        {bottomNavItems.length > 0 && (
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
        )}
      </nav>

      {/* Storage Used Section */}
      <div className="mt-auto flex flex-col gap-3 p-3">
        {/* Storage Used Section */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
          {loading && (
            <div className="space-y-3">
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
            <div className="space-y-3">
              {/* Header with Icon */}
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200 dark:bg-neutral-800 dark:ring-neutral-700">
                  <HardDrive className="size-4 text-black dark:text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-500 text-xs dark:text-gray-400">
                    Dung lượng
                  </p>
                  <p className="font-bold text-black text-sm dark:text-white leading-tight">
                    {formatBytes(used)} <span className="font-normal text-gray-400">/ {formatBytes(limit)}</span>
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress className="h-1.5 bg-gray-200 dark:bg-neutral-800" value={percentage} />
                <div className="flex items-center justify-end">
                  <p className="font-medium text-gray-500 text-xs dark:text-gray-400">
                    {Math.round(percentage)}% đã dùng
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div>
          {userLoading && (
            <div className="space-y-2.5">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          )}
          {!userLoading && localUser && (
            <div className="space-y-2">
              {/* User Info Box */}
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-black font-bold text-white dark:bg-white dark:text-black">
                  <span className="text-xs">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-black text-sm dark:text-white">
                    {localUser.username}
                  </p>
                  <p className="truncate text-gray-500 text-xs dark:text-gray-400">
                    {localUser.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push("/settings")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 font-medium text-gray-700 text-xs transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
                >
                  <Settings className="size-3.5" />
                  <span>Cài đặt</span>
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
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 font-medium text-red-600 text-xs transition-colors hover:bg-red-50 hover:border-red-100 hover:text-red-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                >
                  <LogOut className="size-3.5" />
                  <span>Thoát</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
