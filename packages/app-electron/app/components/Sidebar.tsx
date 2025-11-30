"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const nav = [
    {
      href: "/screens/dashboard",
      label: "Quản lý tài liệu",
      icon: "folder",
    },
    {
      href: "/screens/audit",
      label: "Tra cứu lịch sử",
      icon: "history",
    },
    {
      href: "/screens/blockchain",
      label: "Blockchain",
      icon: "currency_bitcoin",
    },
    {
      href: "/screens/logs",
      label: "Log hệ thống",
      icon: "receipt_long",
    },
    {
      href: "/screens/accounts",
      label: "Tài khoản",
      icon: "group",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col h-screen">
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
            <span className="material-icons text-white text-xl leading-none">
              shield
            </span>
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-900">Secure Docs</div>
            <div className="text-xs text-zinc-500">Document Management</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-4 space-y-1">
          {nav.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  }
                `}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg transition-colors
                  ${isActive ? "bg-white/20" : "bg-zinc-100"}
                `}
                >
                  <span
                    className={`material-icons text-[20px] leading-none
                      ${isActive ? "text-white" : "text-zinc-900"}
                    `}
                  >
                    {item.icon}
                  </span>
                </div>
                <span className="text-sm font-semibold flex-1">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
