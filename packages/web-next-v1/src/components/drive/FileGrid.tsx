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
  const iconMap = {
    folder: "folder",
    image: "image",
    document: "description",
    default: "insert_drive_file",
  };

  const icon = iconMap[type as keyof typeof iconMap] || iconMap.default;

  return <span className={cn("material-icons", className)}>{icon}</span>;
};

export default function FileGrid() {
  const { files, viewMode, selectedFiles, toggleFileSelection, toggleStarred } =
    useDrive();

  return (
    <div
      className={cn(
        "grid gap-3",
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : "grid-cols-1"
      )}
    >
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            "relative p-4 rounded-xl border-2 border-neutral-900 bg-white transition-all duration-200 group cursor-pointer",
            viewMode === "grid"
              ? "hover:shadow-lg hover:border-neutral-700 hover:-translate-y-0.5"
              : "hover:bg-neutral-50 hover:border-neutral-700",
            selectedFiles.has(file.id) &&
              "ring-2 ring-neutral-900 ring-offset-2 shadow-lg bg-neutral-50"
          )}
          onClick={() => toggleFileSelection(file.id)}
        >
          <div
            className={cn(
              "flex items-start gap-3",
              viewMode === "list" && "justify-between w-full"
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <FileTypeIcon
                  type={file.type}
                  className={cn(
                    "transition-all duration-200",
                    viewMode === "grid" ? "text-[48px]" : "text-[40px]",
                    file.type === "folder"
                      ? "text-neutral-900"
                      : "text-neutral-700",
                    "group-hover:scale-105"
                  )}
                />
                {file.shared && (
                  <span className="material-icons text-white absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-0.5 shadow-md text-sm">
                    group
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-semibold text-neutral-900 truncate",
                    viewMode === "grid" ? "text-sm" : "text-base"
                  )}
                >
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
                  <span className="font-medium">
                    {file.type === "folder" ? `${file.items} items` : file.size}
                  </span>
                  {file.starred && (
                    <span
                      className="material-icons text-amber-500 text-base cursor-pointer hover:scale-125 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarred(file.id);
                      }}
                    >
                      star
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1.5">
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
                    "h-8 w-8 rounded-full transition-all duration-200 shrink-0",
                    viewMode === "grid"
                      ? "opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                      : "opacity-100",
                    "hover:bg-neutral-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="material-icons text-xl text-neutral-700">
                    more_vert
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => toggleStarred(file.id)}>
                  <span className="material-icons text-base mr-2">
                    {file.starred ? "star" : "star_outline"}
                  </span>
                  {file.starred ? "Remove star" : "Add star"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="material-icons text-base mr-2">share</span>
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="material-icons text-base mr-2">
                    download
                  </span>
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <span className="material-icons text-base mr-2">
                    delete_outline
                  </span>
                  Move to trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
