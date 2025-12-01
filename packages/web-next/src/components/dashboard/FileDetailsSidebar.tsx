"use client";

import {
  Edit,
  Eye,
  FileText,
  MessageSquare,
  MoreVertical,
  Share2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function FileDetailsSidebar() {
  return (
    <aside className="w-[280px] space-y-10 border-border border-l bg-card p-6">
      {/* File Details */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-border border-b pb-4">
          <h3 className="font-bold">File Details</h3>
          <Button className="size-6" size="icon" variant="ghost">
            <MoreVertical className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-accent p-6">
          <div className="flex size-16 items-center justify-center">
            <FileText className="size-16 text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <Badge className="bg-primary/20 text-primary" variant="secondary">
              Editor
            </Badge>
            <h4 className="font-bold text-lg">accounts.txt</h4>
            <p className="text-muted-foreground text-sm">Modified 2026/02/15</p>
          </div>
        </div>
      </div>

      {/* File Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-border border-b pb-4">
          <h3 className="font-bold">File Overview</h3>
          <Button className="size-6" size="icon" variant="ghost">
            <MoreVertical className="size-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">Total Views</span>
            </div>
            <span className="text-muted-foreground text-sm">198</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">Edits</span>
            </div>
            <span className="text-muted-foreground text-sm">16</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">Comments</span>
            </div>
            <span className="text-muted-foreground text-sm">11</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">Share</span>
            </div>
            <span className="text-muted-foreground text-sm">87</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">Deletes</span>
            </div>
            <span className="text-muted-foreground text-sm">77</span>
          </div>
        </div>
      </div>

      {/* File Insights */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-border border-b pb-4">
          <h3 className="font-bold">File Insights</h3>
          <Button className="size-6" size="icon" variant="ghost">
            <MoreVertical className="size-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-bold text-3xl">6,712</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="size-3" />
                <span>100%</span>
              </div>
              <span className="text-foreground text-sm">last week</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-2">
            <div
              className="flex items-end justify-between gap-2"
              style={{ height: "120px" }}
            >
              {[60, 80, 100, 55, 35, 70, 65].map((height, index) => (
                <div className="flex flex-1 flex-col justify-end" key={index}>
                  <div
                    className="w-full rounded-t-sm bg-primary/30"
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className="w-full rounded-t-sm bg-primary"
                      style={{ height: "55%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-muted-foreground text-xs">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>

          <Button className="w-full" variant="outline">
            See All Insights
          </Button>
        </div>
      </div>
    </aside>
  );
}
