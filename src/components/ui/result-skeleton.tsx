import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ComparisonSkeleton = memo(() => (
  <div className="space-y-6 py-8">
    <Card className="p-6">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </Card>
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ))}
    </div>
  </div>
));

ComparisonSkeleton.displayName = "ComparisonSkeleton";

export const DietPlanSkeleton = memo(() => (
  <div className="space-y-6 py-8">
    <Card className="p-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-4 w-20 mt-2" />
        </div>
        <div className="md:col-span-2 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </Card>
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      ))}
    </div>
  </div>
));

DietPlanSkeleton.displayName = "DietPlanSkeleton";

export const InfoSkeleton = memo(() => (
  <div className="space-y-6 py-8">
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      ))}
    </div>
  </div>
));

InfoSkeleton.displayName = "InfoSkeleton";
