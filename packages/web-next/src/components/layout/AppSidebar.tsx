"use client";

import {
  Clock,
  FileText,
  HardDrive,
  HelpCircle,
  Home,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, badge: null },
  { href: "/files", label: "My Files", icon: FileText, badge: null },
  { href: "/shares", label: "Shares", icon: Users, badge: null },
  { href: "/downloads", label: "Downloads", icon: Clock, badge: null },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];


type AppSidebarProps = {
  stats?: DashboardStats | null;
  loading?: boolean;
};

export default function AppSidebar({ stats, loading }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[280px] flex-col border-border border-r bg-card">
      {/* Logo Section */}
      <div className="border-border border-b px-6 py-6">
        <Link className="flex items-center gap-3" href="/dashboard">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-none">
              SecureDocs
            </h1>
            <p className="text-muted-foreground text-xs">Blockchain Storage</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== null && (
                <Badge
                  className="bg-primary/20 text-primary"
                  variant="secondary"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        <div className="mt-4 border-border border-t pt-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
      <div className="border-border border-t px-4 py-4">
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
        {!loading && stats && (
          <div className="space-y-3">
            {/* Header with Icon */}
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <HardDrive className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-muted-foreground text-xs">
                  Storage Used
                </p>
                <p className="font-bold text-base text-foreground leading-tight">
                  {formatBytes(stats.storageInfo.storageUsed)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <Progress
                className="h-2"
                value={
                  (stats.storageInfo.storageUsed /
                    stats.storageInfo.storageLimit) *
                  100
                }
              />
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  {formatBytes(stats.storageInfo.storageLimit)} total
                </p>
                <p className="font-medium text-primary text-xs">
                  {Math.round(
                    (stats.storageInfo.storageUsed /
                      stats.storageInfo.storageLimit) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
