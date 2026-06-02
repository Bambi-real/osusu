import { SkeletonLine, SkeletonCircle } from '../common/Skeleton';

export default function GroupDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <SkeletonLine width="w-20" height="h-3" />
        <SkeletonLine width="w-3" height="h-3" />
        <SkeletonLine width="w-24" height="h-3" />
      </div>

      {/* Group title */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <SkeletonLine width="w-40" height="h-8" />
          <SkeletonLine width="w-16" height="h-6" />
        </div>
        <SkeletonLine width="w-96" height="h-4" />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 pb-0">
        {[...Array(3)].map((_, i) => (
          <SkeletonLine key={i} width="w-20" height="h-4"
                        className="mb-3" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i}
               className="flex items-center gap-3 p-4
                           bg-gray-50 rounded-xl">
            <SkeletonCircle size="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <SkeletonLine width="w-32" height="h-4" />
              <SkeletonLine width="w-20" height="h-3" />
            </div>
            <SkeletonCircle size="w-8 h-8" />
          </div>
        ))}
      </div>

    </div>
  );
}
