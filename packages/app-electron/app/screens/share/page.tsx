import RootShell from "../../components/RootShell";

export default function SharePage() {
  return (
    <RootShell>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-icons text-2xl text-zinc-900">share</span>
            <h2 className="text-xl font-semibold text-zinc-900">
              Chia sẻ tài liệu
            </h2>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Chọn tệp
              </label>
              <div className="relative">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-zinc-300 rounded-lg bg-white appearance-none focus:border-zinc-500 focus:outline-none">
                  <option>Tài liệu 1.pdf</option>
                  <option>Tài liệu 2.pdf</option>
                </select>
                <span className="material-icons absolute right-3 top-2.5 text-zinc-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Người nhận
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-icons absolute left-3 top-2.5 text-zinc-400">
                    mail
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-lg text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
                    placeholder="Nhập email người nhận..."
                  />
                </div>
                <button
                  type="button"
                  className="px-3 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50"
                >
                  <span className="material-icons text-zinc-600">
                    person_add
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Quyền truy cập
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 border border-zinc-300 rounded-lg cursor-pointer hover:bg-zinc-50">
                  <input
                    type="radio"
                    name="permission"
                    className="text-zinc-900"
                    defaultChecked
                  />
                  <div>
                    <div className="font-medium text-zinc-900">Chỉ xem</div>
                    <div className="text-xs text-zinc-500">
                      Không cho phép chỉnh sửa
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-zinc-300 rounded-lg cursor-pointer hover:bg-zinc-50">
                  <input
                    type="radio"
                    name="permission"
                    className="text-zinc-900"
                  />
                  <div>
                    <div className="font-medium text-zinc-900">Chỉnh sửa</div>
                    <div className="text-xs text-zinc-500">
                      Cho phép sửa nội dung
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-zinc-200">
              <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors inline-flex items-center">
                <span className="material-icons text-sm mr-2">send</span>
                Chia sẻ ngay
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors text-zinc-700"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </RootShell>
  );
}
