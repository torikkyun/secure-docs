"use client";

import { Download, Share2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Activity = {
  id: string;
  type: "upload" | "download" | "share";
  fileName: string;
  timestamp: string;
  user?: string;
};

// Mock data - replace with actual API call
const mockActivities: Activity[] = [
  {
    id: "1",
    type: "upload",
    fileName: "Document.pdf",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    type: "share",
    fileName: "Report.docx",
    timestamp: "1 hour ago",
    user: "john.eth",
  },
  {
    id: "3",
    type: "download",
    fileName: "Image.png",
    timestamp: "3 hours ago",
  },
  {
    id: "4",
    type: "upload",
    fileName: "Presentation.pptx",
    timestamp: "Yesterday",
  },
  {
    id: "5",
    type: "share",
    fileName: "Contract.pdf",
    timestamp: "2 days ago",
    user: "alice.eth",
  },
];

function getActivityIcon(type: Activity["type"]) {
  const iconClass = "size-4";

  switch (type) {
    case "upload": {
      return <Upload className={iconClass} />;
    }
    case "download": {
      return <Download className={iconClass} />;
    }
    case "share": {
      return <Share2 className={iconClass} />;
    }
    default: {
      return <Upload className={iconClass} />;
    }
  }
}
function getActivityColor(type: Activity["type"]) {
  switch (type) {
    case "upload": {
      return "bg-primary/10 text-primary";
    }
    case "download": {
      return "bg-green-500/10 text-green-600";
    }
    case "share": {
      return "bg-amber-500/10 text-amber-600";
    }
    default: {
      return "bg-muted text-muted-foreground";
    }
  }
}

function getActivityText(activity: Activity) {
  switch (activity.type) {
    case "upload": {
      return `Uploaded ${activity.fileName}`;
    }
    case "download": {
      return `Downloaded ${activity.fileName}`;
    }
    case "share": {
      return `Shared ${activity.fileName}${activity.user ? ` with ${activity.user}` : ""}`;
    }
    default: {
      return activity.fileName;
    }
  }
}

export default function RecentActivity() {
  const loading = false; // Replace with actual loading state

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="flex items-start gap-3" key={i}>
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div className="flex items-start gap-3" key={activity.id}>
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-foreground text-sm">
                  {getActivityText(activity)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
