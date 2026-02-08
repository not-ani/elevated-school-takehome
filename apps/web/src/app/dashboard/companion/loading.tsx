import { Skeleton } from "@/components/ui/skeleton";

export default function CompanionLoading() {
  return (
    <div className="bg-card mx-auto h-[calc(100vh-8rem)] max-w-7xl overflow-hidden rounded-xl border">
      <div className="grid h-full min-h-0 grid-rows-[220px_1fr] md:grid-cols-[290px_1fr] md:grid-rows-1">
        <div className="border-b p-3 md:border-r md:border-b-0">
          <Skeleton className="mb-3 h-6 w-28 rounded-md" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="flex h-full flex-col gap-4">
            <Skeleton className="h-6 w-40 rounded-md" />
            <div className="flex-1 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
