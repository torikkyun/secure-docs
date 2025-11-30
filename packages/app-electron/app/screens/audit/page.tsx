"use client";

import RootShell from "../../components/RootShell";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;
const TOTAL_ITEMS = 156;

export default function AuditPage() {
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
                history
              </span>
              <h2 className="text-xl font-semibold text-zinc-900">
                Tra cứu Lịch sử
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <span className="material-icons absolute left-3 top-2.5 text-zinc-400">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
                  placeholder="Tìm kiếm..."
                />
              </div>
              <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors inline-flex items-center">
                <span className="material-icons text-sm mr-2">
                  file_download
                </span>
                Xuất
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => {
              const itemIndex = startIndex + i;
              if (itemIndex >= TOTAL_ITEMS) return null;
              return (
                <div
                  key={itemIndex}
                  className="p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-white text-lg">
                          {itemIndex % 3 === 0
                            ? "share"
                            : itemIndex % 3 === 1
                            ? "block"
                            : "edit"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-zinc-900">
                          {itemIndex % 3 === 0
                            ? "Chia sẻ tài liệu"
                            : itemIndex % 3 === 1
                            ? "Thu hồi quyền"
                            : "Chỉnh sửa"}
                        </div>
                        <div className="text-sm text-zinc-500 mt-1">
                          Thực hiện bởi:{" "}
                          <span className="font-medium">
                            User {itemIndex + 1}
                          </span>{" "}
                          • 2025-11-{Math.max(1, 17 - (itemIndex % 30))}
                        </div>
                        <div className="text-sm text-zinc-500 mt-0.5">
                          Tài liệu {(itemIndex % 50) + 1}.pdf
                        </div>
                      </div>
                    </div>
                    <button className="inline-flex items-center px-3 py-1.5 border border-zinc-300 rounded-lg hover:bg-zinc-50 text-sm font-medium text-zinc-700 flex-shrink-0">
                      <span className="material-icons text-sm">more_vert</span>
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
              kết quả
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
