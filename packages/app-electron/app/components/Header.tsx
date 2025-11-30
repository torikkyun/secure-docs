"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/screens/dashboard":
        return "Quản lý tài liệu";
      case "/screens/upload":
        return "Upload tài liệu";
      case "/screens/share":
        return "Chia sẻ tài liệu";
      case "/screens/audit":
        return "Tra cứu lịch sử / Báo cáo";
      case "/screens/blockchain":
        return "Tra cứu blockchain";
      case "/screens/logs":
        return "Xem log hệ thống";
      case "/screens/accounts":
        return "Quản lý tài khoản";
      default:
        return "Bảng điều khiển";
    }
  };

  return (
    <header className="w-full bg-white border-b border-zinc-200 shadow-sm">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
                {getPageTitle(pathname)}
              </h1>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 transition-all duration-150">
                <span className="material-icons text-zinc-600 hover:text-zinc-900">
                  notifications
                </span>
              </button>
              <button className="p-2 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 transition-all duration-150">
                <span className="material-icons text-zinc-600 hover:text-zinc-900">
                  help_outline
                </span>
              </button>
            </div>

            {/* User profile dropdown */}
            <div
              className="relative flex items-center gap-3 border-l border-zinc-200 pl-4 sm:pl-6"
              ref={dropdownRef}
            >
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 rounded-lg py-1.5 px-2 hover:bg-zinc-50 active:bg-zinc-100 transition-colors group"
              >
                <div className="w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm">
                  A
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-medium text-sm text-zinc-900 group-hover:text-zinc-800">
                    Người dùng
                  </div>
                  <div className="text-xs text-zinc-500 group-hover:text-zinc-600">
                    staff@example.com
                  </div>
                </div>
                <span
                  className={`material-icons text-zinc-400 text-lg hidden sm:block group-hover:text-zinc-600 transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Profile Dropdown Modal */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-lg bg-white shadow-lg ring-1 ring-zinc-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-zinc-100">
                    <div className="font-medium text-sm text-zinc-900">
                      staff@example.com
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Staff Account
                    </div>
                  </div>

                  <div className="py-1">
                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors group">
                      <span className="material-icons text-zinc-400 text-lg group-hover:text-zinc-600">
                        account_circle
                      </span>
                      Thông tin tài khoản
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors group">
                      <span className="material-icons text-zinc-400 text-lg group-hover:text-zinc-600">
                        settings
                      </span>
                      Cài đặt hệ thống
                    </button>
                    <div className="h-[1px] bg-zinc-100 my-1"></div>
                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group">
                      <span className="material-icons text-red-400 text-lg group-hover:text-red-600">
                        logout
                      </span>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
