"use client";

import React, { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  docName?: string;
  onShare?: (email: string, permission: string) => void;
};

export default function ShareModal({ open, onClose, docName, onShare }: Props) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("Chỉ xem");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900">
            Chia sẻ tài liệu
          </h3>
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
            Nhập email người nhận hoặc chọn quyền truy cập.
          </div>

          <div className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2"
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2"
            >
              <option>Chỉ xem</option>
              <option>Chỉnh sửa</option>
            </select>
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
                if (onShare) onShare(email, permission);
                setEmail("");
                setPermission("Chỉ xem");
                onClose();
              }}
              className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
