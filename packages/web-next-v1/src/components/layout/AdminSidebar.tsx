"use client";

import { FileText, Home, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home, badge: null },
  { href: "/admin/files", label: "All Files", icon: FileText, badge: null },
  { href: "/admin/users", label: "All Users", icon: Users, badge: null },
];

const bottomNavItems = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[280px] flex-col border-border border-r bg-card">
      {/* Logo Section */}
      <div className="border-border border-b px-6 py-6">
        <Link className="flex items-center gap-3" href="/admin/dashboard">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-none">
              SecureDocs
            </h1>
            <p className="text-muted-foreground text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-1 px-3">
        {adminNavItems.map((item) => {
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

      {/* System Info Section */}
      {/* <div className="mt-auto border-border border-t p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Database className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-muted-foreground text-xs">
              System Status
            </p>
            <p className="font-bold text-foreground text-sm leading-tight">
              All Systems Active
            </p>
          </div>
        </div>
      </div> */}
    </aside>
  );
}
