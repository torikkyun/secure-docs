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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {["total", "received", "shares"].map((type) => (
          <Card className="transition-transform hover:scale-[1.02]" key={type}>
            <CardContent className="p-6">
              <div className="mb-2">
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-10 w-20" />
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Files */}
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Files</p>
              <p className="mt-2 font-bold text-2xl text-foreground md:text-3xl">
                {new Intl.NumberFormat().format(stats.totalFiles)}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">All time</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 p-2">
              <FileText aria-hidden className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Received */}
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Files Received</p>
              <p className="mt-2 font-bold text-2xl text-foreground md:text-3xl">
                {new Intl.NumberFormat().format(stats.filesReceived)}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Received from others
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 p-2">
              <Users aria-hidden className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Shares */}
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Shares</p>
              <p className="mt-2 font-bold text-2xl text-foreground md:text-3xl">
                {new Intl.NumberFormat().format(stats.activeShares)}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Currently active grants
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 p-2">
              <Share2 aria-hidden className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
