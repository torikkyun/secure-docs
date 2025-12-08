"use client";

import { FileText, Share2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types/api";

type StatsCardsProps = {
  stats: DashboardStats | null;
  loading: boolean;
};

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 w-full">
        {["total", "received", "shares"].map((type) => (
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm" key={type}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-8 w-12 bg-gray-200 dark:bg-zinc-800" />
                  <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-zinc-800" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-zinc-800" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 w-full">
      {/* Total Files */}
      <Card className="group bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-lg hover:border-black dark:hover:border-white transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <p className="font-bold text-4xl text-black dark:text-white leading-none tracking-tight">
                {new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(stats.totalFiles)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tệp được tải lên</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex-shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
              <FileText className="h-6 w-6 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Received */}
      <Card className="group bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-lg hover:border-black dark:hover:border-white transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <p className="font-bold text-4xl text-black dark:text-white leading-none tracking-tight">
                {new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(stats.filesReceived)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tệp nhận được</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex-shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
              <Users className="h-6 w-6 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Shares */}
      <Card className="group bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-lg hover:border-black dark:hover:border-white transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <p className="font-bold text-4xl text-black dark:text-white leading-none tracking-tight">
                {new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(stats.activeShares)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Chia sẻ hoạt động</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex-shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
              <Share2 className="h-6 w-6 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
