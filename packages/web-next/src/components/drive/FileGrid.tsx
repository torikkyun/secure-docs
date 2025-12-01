import {
  File,
  Folder,
  MoreVertical,
  Users,
  Star,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useDrive } from "@/contexts/DriveContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

const FileTypeIcon = ({
  type,
  className,
}: {
  type: string;
  className?: string;
}) => {
  switch (type) {
    case "folder":
      return <Folder className={cn("text-[#4285f4]", className)} />;
    case "image":
      return <ImageIcon className={cn("text-[#34A853]", className)} />;
    case "document":
      return <FileText className={cn("text-[#4285f4]", className)} />;
    default:
      return <File className={cn("text-gray-600", className)} />;
  }
};

export default function FileGrid() {
  const { files, viewMode, selectedFiles, toggleFileSelection, toggleStarred } =
    useDrive();

  return (
    <div
      className={cn(
        "grid gap-3",
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : "grid-cols-1"
      )}
    >
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            "relative p-4 rounded-xl border border-gray-200/80 bg-white transition-all duration-300 group cursor-pointer",
            viewMode === "grid"
              ? "hover:bg-blue-50/30 hover:shadow-lg hover:scale-[1.02] hover:border-blue-100"
              : "hover:bg-blue-50/30 hover:border-blue-100",
            selectedFiles.has(file.id) &&
              "ring-2 ring-blue-500 ring-offset-2 shadow-lg border-blue-200"
          )}
          onClick={() => toggleFileSelection(file.id)}
        >
          <div
            className={cn(
              "flex items-start",
              viewMode === "list" && "justify-between w-full"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="relative bg-gradient-to-br from-white to-blue-50/50 p-2 rounded-lg">
                  <FileTypeIcon
                    type={file.type}
                    className={cn(
                      "transition-all duration-300",
                      viewMode === "grid" ? "h-12 w-12" : "h-10 w-10",
                      "group-hover:scale-110 group-hover:rotate-2"
                    )}
                  />
                  {file.shared && (
                    <Users
                      className={cn(
                        "text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm",
                        viewMode === "grid" ? "h-5 w-5" : "h-4 w-4"
                      )}
                    />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-semibold text-gray-900 truncate transition-colors",
                    viewMode === "grid" ? "max-w-[180px]" : "max-w-[300px]",
                    "group-hover:text-blue-700"
                  )}
                >
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600 font-medium">
                    {file.type === "folder" ? `${file.items} items` : file.size}
                  </span>
                  {file.starred && (
                    <Star
                      className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-sm hover:scale-110 transition-transform cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarred(file.id);
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  {new Date(file.modifiedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "transition-all duration-300",
                    viewMode === "grid"
                      ? "opacity-0 group-hover:opacity-100 absolute top-2 right-2 scale-90 group-hover:scale-100"
                      : "opacity-100",
                    "hover:bg-blue-50 hover:text-blue-600"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => toggleStarred(file.id)}>
                  <Star className="h-4 w-4 mr-2" />
                  {file.starred ? "Remove star" : "Add star"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Chuyển vào thùng rác
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
