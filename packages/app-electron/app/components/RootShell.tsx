"use client";

import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto bg-zinc-100">
          <div className="max-w-screen-2xl mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
