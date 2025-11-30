"use client";

import RootShell from "../../components/RootShell";
import { useState, useEffect } from "react";
import UploadModal from "../../components/modals/UploadModal";
import ShareModal from "../../components/modals/ShareModal";
import RevokeModal from "../../components/modals/RevokeModal";

const ITEMS_PER_PAGE = 10;
const TOTAL_ITEMS = 124;

export default function DashboardPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<number | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, TOTAL_ITEMS);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        // Show floating button when scrolled past 100px
        const scrolled = window.document.documentElement.scrollTop > 100;
        setShowFloatingButton(scrolled);
      }
    };

    // Initial check
    handleScroll();

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <RootShell>
      <UploadModal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      <ShareModal
        open={isShareOpen}
        docName={
          activeDoc !== null ? `Tài liệu ${activeDoc + 1}.pdf` : undefined
        }
        onClose={() => {
          setIsShareOpen(false);
          setActiveDoc(null);
        }}
        onShare={(email, permission) => {
          // TODO: implement share API call
          console.log("Share", { email, permission, doc: activeDoc });
        }}
      />

      <RevokeModal
        open={isRevokeOpen}
        docName={
          activeDoc !== null ? `Tài liệu ${activeDoc + 1}.pdf` : undefined
        }
        onClose={() => {
          setIsRevokeOpen(false);
          setActiveDoc(null);
        }}
        onConfirm={() => {
          // TODO: implement revoke API call
          console.log("Revoke", { doc: activeDoc });
        }}
      />

      <div className="bg-white rounded-xl border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-icons text-2xl text-zinc-900">
                description
              </span>
              <h2 className="text-xl font-semibold text-zinc-900">
                Quản lý tài liệu
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
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors inline-flex items-center"
              >
                <span className="material-icons text-sm mr-2">upload</span>
                Tải lên
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
                          description
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-zinc-900">
                          Tài liệu {itemIndex + 1}.pdf
                        </h3>
                        <div className="text-sm text-zinc-500 mt-1">
                          Tải lên bởi: staff • {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setActiveDoc(itemIndex);
                          setIsShareOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-zinc-300 rounded-lg hover:bg-zinc-50 text-sm font-medium text-zinc-700"
                      >
                        <span className="material-icons text-sm mr-1">
                          share
                        </span>
                        Chia sẻ
                      </button>
                      <button
                        onClick={() => {
                          setActiveDoc(itemIndex);
                          setIsRevokeOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-zinc-300 rounded-lg hover:bg-zinc-50 text-sm font-medium text-zinc-700"
                      >
                        <span className="material-icons text-sm mr-1">
                          block
                        </span>
                        Thu hồi
                      </button>
                    </div>
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
              tài liệu
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

      {/* Floating upload button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsUploadOpen(true)}
          className={`w-14 h-14 bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all duration-300 ease-in-out flex items-center justify-center ${
            showFloatingButton
              ? "translate-y-0 opacity-100 visible"
              : "translate-y-16 opacity-0 invisible pointer-events-none"
          }`}
          aria-label="Tải tài liệu lên"
        >
          <span className="material-icons text-2xl">upload</span>
        </button>
      </div>
    </RootShell>
  );
}
