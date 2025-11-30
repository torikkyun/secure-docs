"use client";

import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  docName?: string;
  onConfirm?: () => void;
};

export default function RevokeModal({
  open,
  onClose,
  docName,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900">Thu hồi quyền</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <span className="material-icons text-zinc-500">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 text-sm text-zinc-700">
            {docName ? (
              <div className="font-medium text-zinc-900 mb-2">{docName}</div>
            ) : null}
            Bạn có chắc muốn thu hồi quyền truy cập cho tài liệu này?
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thu hồi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
