"use client";

import { DriveProvider } from "@/contexts/DriveContext";
import TrashPage from "./trash-page";

export default function Page() {
  return (
    <DriveProvider>
      <TrashPage />
    </DriveProvider>
  );
}
