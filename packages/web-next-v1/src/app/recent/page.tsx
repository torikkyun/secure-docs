"use client";

import { DriveProvider } from "@/contexts/DriveContext";
import RecentPage from "./recent-page";

export default function Page() {
  return (
    <DriveProvider>
      <RecentPage />
    </DriveProvider>
  );
}
