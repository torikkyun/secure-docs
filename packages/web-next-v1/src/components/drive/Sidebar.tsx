import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: "home", label: "My Drive", href: "/" },
    { icon: "people", label: "Shared with me", href: "/shared" },
    { icon: "schedule", label: "Recent", href: "/recent" },
    { icon: "star_outline", label: "Starred", href: "/starred" },
    { icon: "delete_outline", label: "Trash", href: "/trash" },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 h-[calc(100vh-64px)] bg-white py-4 px-2">
      <div className="mb-6 px-2">
        <Button
          className="w-full justify-start gap-3 shadow-md bg-white hover:bg-neutral-50 hover:shadow-lg text-neutral-900 border border-neutral-200 rounded-full h-12 font-medium transition-all"
          size="lg"
        >
          <span className="material-icons">add</span>
          New
        </Button>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-neutral-100 rounded-full text-neutral-700 font-medium",
                pathname === item.href &&
                  "bg-neutral-900 text-white hover:bg-neutral-800"
              )}
            >
              <span className="material-icons">{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-neutral-200 px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 px-3">
            <span className="material-icons text-xl">cloud_queue</span>
            Storage
          </div>
          <div className="px-3">
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-2 bg-neutral-900 rounded-full w-1/4 transition-all duration-500" />
            </div>
            <p className="text-xs text-neutral-600 mt-2">
              25 GB of 100 GB used
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-900 hover:bg-neutral-100 px-2 py-1 h-auto text-xs font-medium mt-2 w-full justify-start"
            >
              Get more storage
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
