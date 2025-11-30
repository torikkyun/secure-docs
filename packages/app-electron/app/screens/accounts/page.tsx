"use client";

import RootShell from "../../components/RootShell";
import { useState } from "react";

const ITEMS_PER_PAGE = 6;
const TOTAL_ITEMS = 24;

export default function AccountsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, TOTAL_ITEMS);

  return (
    <RootShell>
      <div className="bg-white rounded-xl border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-icons text-2xl text-zinc-900">
                manage_accounts
              </span>
              <h2 className="text-xl font-semibold text-zinc-900">
                Quản lý tài khoản
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <span className="material-icons absolute left-3 top-2.5 text-zinc-400">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
                  placeholder="Tìm kiếm người dùng..."
                />
              </div>
              <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors inline-flex items-center">
                <span className="material-icons text-sm mr-2">person_add</span>
                Thêm mới
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-3">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => {
              const itemIndex = startIndex + i;
              if (itemIndex >= TOTAL_ITEMS) return null;
              return (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {itemIndex % 2 === 0 ? (
                        <span className="material-icons">person</span>
                      ) : (
                        "U"
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900">
                        user{itemIndex}@example.com
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-xs">
                          <span className="material-icons text-xs">badge</span>
                          staff
                        </span>
                        <span className="text-xs text-zinc-500">
                          Hoạt động lần cuối: 2 giờ trước
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center px-3 py-1.5 border border-zinc-300 rounded-lg hover:bg-zinc-50 text-sm font-medium text-zinc-700">
                      <span className="material-icons text-sm mr-1">edit</span>
                      Chỉnh sửa
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 border border-zinc-300 rounded-lg hover:bg-zinc-50 text-sm font-medium text-red-600">
                      <span className="material-icons text-sm mr-1">block</span>
                      Khóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200 flex items-center justify-between">
            <div className="text-sm text-zinc-600">
              Hiển thị{" "}
              <span className="font-semibold text-zinc-900">
                {startIndex + 1}-{endIndex}
              </span>{" "}
              trong số{" "}
              <span className="font-semibold text-zinc-900">{TOTAL_ITEMS}</span>{" "}
              người dùng
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-icons text-sm">chevron_left</span>
              </button>
              <div className="text-sm text-zinc-600 px-2">
                Trang{" "}
                <span className="font-semibold text-zinc-900">
                  {currentPage}
                </span>{" "}
                / {totalPages}
              </div>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </RootShell>
  );
}
