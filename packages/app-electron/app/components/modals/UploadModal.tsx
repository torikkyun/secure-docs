"use client";

import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function UploadModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900">Upload tài liệu</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
            <span className="material-icons text-zinc-500">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="border-2 border-dashed border-zinc-200 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="material-icons text-zinc-600 text-2xl">upload_file</span>
            </div>
            <div className="text-sm text-zinc-600 mb-4">
              Kéo thả file vào đây hoặc
              <label className="text-zinc-900 font-medium mx-1 cursor-pointer hover:text-zinc-700">
                chọn file
                <input type="file" className="hidden" />
              </label>
              để upload
            </div>
            <div className="text-xs text-zinc-500">Hỗ trợ: PDF, Word, Excel, PowerPoint</div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">
              Hủy
            </button>
            <button className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors">Upload</button>
          </div>
        </div>
      </div>
    </div>
  );
}
