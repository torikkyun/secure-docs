"use client";

import { useUnifiedSidebar } from "@/contexts/UnifiedSidebarContext";
import FileDetailsSidebar from "./FileDetailsSidebar";
import ShareDetailsSidebar from "./ShareDetailsSidebar";

export default function UnifiedDetailsSidebar() {
  const { content, isOpen, closeSidebar } = useUnifiedSidebar();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile/tablet - only on smaller screens */}
      <button
        aria-label="Close sidebar"
        className="fixed inset-0 z-40 bg-black/50 xl:hidden"
        onClick={closeSidebar}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            closeSidebar();
          }
        }}
        type="button"
      />

      {/* Sidebar - slide from right on mobile, inline on xl+ */}
      <div className="fixed top-0 right-0 bottom-0 z-50 xl:relative xl:top-auto xl:bottom-auto xl:z-auto">
        {content?.type === "file" && (
          <FileDetailsSidebar isOpen={isOpen} onCloseAction={closeSidebar} />
        )}
        {content?.type === "share" && (
          <ShareDetailsSidebar
            isOpen={isOpen}
            onCloseAction={closeSidebar}
            selectedGrant={content.data}
            type={content.shareType}
          />
        )}
      </div>
    </>
  );
}
