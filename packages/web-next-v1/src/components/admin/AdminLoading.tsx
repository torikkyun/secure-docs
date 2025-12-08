import AppLayout from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

type AdminLoadingProps = {
  title: string;
  description: string;
  breadcrumbs: string[];
};

/**
 * Component hiển thị loading state cho admin pages
 */
export function AdminLoading({
  title,
  description,
  breadcrumbs,
}: AdminLoadingProps) {
  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      description={description}
      showDetailsSidebar={false}
      title={title}
      variant="admin"
    >
      <div className="space-y-4 p-4 md:p-6 lg:p-8">
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => `loading-${i}`).map((key) => (
              <Skeleton className="h-16 w-full" key={key} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
