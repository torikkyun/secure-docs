"use client";

import {
  FileText,
  HelpCircle,
  Home,
  Settings,
  Share2,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home, badge: null },
  { href: "/files", label: "My Files", icon: FileText, badge: null },
  { href: "/shared", label: "Shared", icon: Users, badge: 2 },
  { href: "/starred", label: "Starred", icon: Star, badge: null },
  { href: "/trash", label: "Trash", icon: Trash2, badge: null },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[280px] flex-col border-border border-r bg-card p-4">
      {/* Logo */}
      <div className="mb-8 px-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Share2 className="size-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">SecureDocs</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 px-3">
        <div className="relative">
          <input
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== null && (
                <Badge
                  className="bg-primary/20 text-primary hover:bg-primary/30"
                  variant="secondary"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        <div className="py-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
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

      {/* Bottom Card */}
      <div className="mt-auto space-y-4">
        <div className="rounded-2xl bg-accent p-4">
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/20">
            <Star className="size-5 text-primary" />
          </div>
          <p className="mb-3 text-muted-foreground text-sm">
            Enjoy unlimited access to our app with only a small price monthly.
          </p>
          <div className="flex gap-2">
            <Button className="h-8 text-xs" size="sm" variant="ghost">
              Dismiss
            </Button>
            <Button className="h-8 text-xs" size="sm">
              Go Pro
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-border border-t pt-4">
          <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-600" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold text-sm">User Name</p>
            <p className="truncate text-muted-foreground text-xs">
              Basic Member
            </p>
          </div>
          <Button className="size-8" size="icon" variant="ghost">
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </Button>
        </div>
      </div>
    </aside>
  );
}
