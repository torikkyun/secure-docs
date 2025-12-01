"use client";

import { DriveProvider } from "@/contexts/DriveContext";
import StarredPage from "./starred-page";

export default function Page() {
  return (
    <DriveProvider>
      <StarredPage />
    </DriveProvider>
  );
}
