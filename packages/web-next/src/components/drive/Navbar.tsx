import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="h-16 border-b border-neutral-200 px-4 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-neutral-100 rounded-full"
        >
          <span className="material-icons text-neutral-700">menu</span>
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <span className="material-icons text-2xl">cloud_queue</span>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
            SecureDocs
          </h1>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl px-6">
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 text-xl">
            search
          </span>
          <Input
            placeholder="Search in Drive"
            className="pl-11 bg-neutral-50 border-neutral-200 focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-full h-11"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-neutral-100 rounded-full"
        >
          <span className="material-icons text-neutral-700">help_outline</span>
        </Button>
        <Link href="/settings">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-neutral-100 rounded-full"
          >
            <span className="material-icons text-neutral-700">settings</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-neutral-100 rounded-full ml-2"
        >
          <span className="material-icons text-neutral-700">
            account_circle
          </span>
        </Button>
      </div>
    </nav>
  );
}
