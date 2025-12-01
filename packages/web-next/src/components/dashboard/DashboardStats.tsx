"use client";

import { FileText, HardDrive, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types/dashboard";

interface DashboardStatsProps {
  stats: DashboardStats;
}

export default function DashboardStatsComponent({
  stats,
}: DashboardStatsProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / k ** i) * 100) / 100 + " " + sizes[i];
  };

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-slate-200 bg-white transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-semibold text-slate-700 text-sm">
            Total Files
          </CardTitle>
          <FileText className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl text-slate-900">
            {stats.totalFiles}
          </div>
          <p className="mt-1 text-slate-500 text-xs">Encrypted files stored</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-semibold text-slate-700 text-sm">
            Storage Used
          </CardTitle>
          <HardDrive className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl text-slate-900">
            {formatBytes(stats.storageUsed)}
          </div>
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-slate-500 text-xs">
              {storagePercentage.toFixed(1)}% of{" "}
              {formatBytes(stats.storageLimit)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-semibold text-slate-700 text-sm">
            Shared Files
          </CardTitle>
          <Users className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl text-slate-900">
            {stats.sharedFiles}
          </div>
          <p className="mt-1 text-slate-500 text-xs">
            Files shared with others
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-semibold text-slate-700 text-sm">
            Downloads
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl text-slate-900">
            {stats.recentDownloads}
          </div>
          <p className="mt-1 text-slate-500 text-xs">Last 7 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
