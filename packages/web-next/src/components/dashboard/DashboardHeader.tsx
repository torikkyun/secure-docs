"use client";

import {
  ChevronRight,
  Link as LinkIcon,
  Plus,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title?: string;
  breadcrumbs?: string[];
}

export default function DashboardHeader({
  title = "My Files",
  breadcrumbs = ["My Files", "Secret Folder"],
}: DashboardHeaderProps) {
  return (
    <div className="space-y-6 border-border border-b bg-card p-8">
      {/* Top Row - Breadcrumbs and Actions */}
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div className="flex items-center gap-2" key={index}>
              {index > 0 && (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "font-semibold text-foreground"
                    : "cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline">
            <Star className="mr-2 size-4" />
            Go Pro
          </Button>
          <Button size="sm">
            <Share2 className="mr-2 size-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Bottom Row - Search and Tools */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-5 text-muted-foreground" />
          <Input
            className="h-12 bg-background pr-12 pl-10"
            placeholder="Search files and folders..."
            type="search"
          />
          <SlidersHorizontal className="-translate-y-1/2 absolute top-1/2 right-3 size-5 text-muted-foreground" />
        </div>

        {/* Tool Buttons */}
        <div className="flex items-center gap-2">
          <Button className="size-10" size="icon" variant="outline">
            <Settings className="size-5" />
          </Button>
          <Button className="size-10" size="icon" variant="outline">
            <LinkIcon className="size-5" />
          </Button>
          <Button className="size-10" size="icon" variant="outline">
            <Plus className="size-5" />
          </Button>
          <div className="relative size-10">
            <div className="absolute right-0 size-10 overflow-hidden rounded-full border-2 border-primary">
              <div className="size-full bg-gradient-to-br from-primary to-purple-600" />
              <div className="absolute top-0 right-0 size-2.5 rounded-full border-2 border-card bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
