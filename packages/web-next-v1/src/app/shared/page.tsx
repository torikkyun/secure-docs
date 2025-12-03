"use client";

import { DriveProvider } from "@/contexts/DriveContext";
import SharedPage from "./shared-page";

export default function Page() {
  return (
    <DriveProvider>
      <SharedPage />
    </DriveProvider>
  );
}
