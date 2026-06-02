import { SkeletonLine, SkeletonCard } from '../common/Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Hero banner skeleton */}
      <div className="bg-gray-200 rounded-2xl h-44
                      relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full
                        animate-[shimmer_1.5s_infinite]
                        bg-gradient-to-r from-transparent
                        via-white/30 to-transparent" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border
                                  border-gray-200 p-5 space-y-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            <div className="w-1/2 h-6 bg-gray-200 rounded-md" />
            <div className="w-3/4 h-3 bg-gray-100 rounded-md" />
            <div className="w-1/2 h-3 bg-gray-100 rounded-md" />
          </div>
        ))}
      </div>

      {/* Section heading */}
      <div className="w-32 h-6 bg-gray-200 rounded-md" />

      {/* Group cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2
                      lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

    </div>
  );
}
