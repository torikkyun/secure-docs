import { Button } from "../ui/button";
import {
  Plus,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Cloud,
  Laptop,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 border-r border-gray-200 h-[calc(100vh-64px)] bg-white py-2 px-3">
      <div className="mb-6">
        <Button
          className="w-full justify-start gap-2 shadow-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          New
        </Button>
      </div>

      <div className="space-y-1.5">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-gray-100"
          size="lg"
        >
          <HardDrive className="h-4 w-4" />
          My Drive
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-gray-100"
          size="lg"
        >
          <Users className="h-4 w-4" />
          Shared with me
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-gray-100"
          size="lg"
        >
          <Clock className="h-4 w-4" />
          Recent
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-gray-100"
          size="lg"
        >
          <Star className="h-4 w-4" />
          Starred
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-gray-100"
          size="lg"
        >
          <Trash2 className="h-4 w-4" />
          Trash
        </Button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 hover:bg-gray-100 text-gray-700"
            size="lg"
          >
            <Cloud className="h-5 w-5" />
            Storage
          </Button>
          <div className="px-3 py-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-1.5 bg-[#4285f4] rounded-full w-1/4 transition-all duration-500" />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-600">25 GB of 100 GB used</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#4285f4] hover:bg-blue-50 px-3 py-1 h-auto text-sm"
              >
                Get more storage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
