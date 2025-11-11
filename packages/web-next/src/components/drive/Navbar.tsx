import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  Settings,
  HelpCircle,
  Menu,
  Grid,
  List,
  Info,
} from "lucide-react";

export default function Navbar() {
  return (
    <nav className="h-16 border-b px-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </Button>
        <Image
          src="/google-drive-logo.svg"
          alt="Google Drive"
          width={24}
          height={24}
          priority
        />
        <h1 className="text-xl text-gray-700">Drive</h1>
      </div>

      <div className="flex-1 max-w-2xl px-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search in Drive"
            className="pl-10 bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
          <HelpCircle className="h-5 w-5 text-gray-700" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
          <Settings className="h-5 w-5 text-gray-700" />
        </Button>
        <div className="flex items-center gap-2 ml-2">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <List className="h-5 w-5 text-gray-700" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Grid className="h-5 w-5 text-gray-700" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Info className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
