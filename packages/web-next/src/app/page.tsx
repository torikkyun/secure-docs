"use client";

import { DriveProvider } from "@/contexts/DriveContext";
import DrivePage from "./drive-page";

export default function Page() {
  return (
    <DriveProvider>
      <DrivePage />
    </DriveProvider>
  );
}
