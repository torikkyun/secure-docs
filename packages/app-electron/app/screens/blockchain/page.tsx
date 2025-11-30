import RootShell from "../../components/RootShell";

export default function BlockchainPage() {
  return (
    <RootShell>
      <div className="bg-white rounded-xl border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-icons text-2xl text-zinc-900">
                currency_bitcoin
              </span>
              <h2 className="text-xl font-semibold text-zinc-900">
                Tra cứu Blockchain
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <span className="material-icons absolute left-3 top-2.5 text-zinc-400">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
                  placeholder="Nhập transaction hash..."
                />
              </div>
              <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors inline-flex items-center">
                <span className="material-icons text-sm mr-2">search</span>
                Tra cứu
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="p-5 border border-zinc-200 rounded-xl hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-white text-lg">
                      check_circle
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 mb-1">
                      Chi tiết giao dịch
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">TxHash:</span>
                        <span className="font-mono text-zinc-900 break-all text-right">
                          0x1234567890abcdef...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Block:</span>
                        <span className="font-mono text-zinc-900">
                          #18,234,567
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Timestamp:</span>
                        <span className="text-zinc-900">
                          2025-11-17 08:30:45
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Trạng thái:</span>
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Xác nhận
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="inline-flex items-center px-3 py-1.5 border border-zinc-300 rounded-lg hover:bg-zinc-50 text-sm font-medium text-zinc-700 flex-shrink-0">
                  <span className="material-icons text-sm mr-1">
                    expand_more
                  </span>
                  Chi tiết
                </button>
              </div>
            </div>

            <div className="p-5 border border-zinc-200 rounded-xl hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-white text-lg">
                      verify
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 mb-1">
                      Xác thực tài liệu
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Document ID:</span>
                        <span className="font-mono text-zinc-900 break-all text-right">
                          doc_1234567890abcdef
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Hash:</span>
                        <span className="font-mono text-zinc-900 text-right break-all">
                          sha256:abcdef123...
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Kết quả:</span>
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                          <span className="material-icons text-xs">
                            verified_user
                          </span>
                          Hợp lệ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="inline-flex items-center px-3 py-1.5 border border-zinc-300 rounded-lg hover:bg-zinc-50 text-sm font-medium text-zinc-700 flex-shrink-0">
                  <span className="material-icons text-sm mr-1">
                    expand_more
                  </span>
                  Chi tiết
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200">
            <div className="text-sm text-zinc-600">
              Hiển thị 2 kết quả gần đây
            </div>
          </div>
        </div>
      </div>
    </RootShell>
  );
}
