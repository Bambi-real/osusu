const shimmer = `
  relative overflow-hidden bg-gray-200
  before:absolute before:inset-0
  before:-translate-x-full
  before:animate-[shimmer_1.5s_infinite]
  before:bg-gradient-to-r
  before:from-transparent
  before:via-white/60
  before:to-transparent
`;

export function SkeletonLine({
  width = 'w-full',
  height = 'h-4',
  className = ''
}) {
  return (
    <div className={`${shimmer} rounded-md
                     ${width} ${height} ${className}`} />
  );
}

export function SkeletonCircle({ size = 'w-10 h-10' }) {
  return (
    <div className={`${shimmer} rounded-full ${size}`} />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl border
                     border-gray-200 p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle size="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-1/2" height="h-4" />
          <SkeletonLine width="w-1/3" height="h-3" />
        </div>
      </div>
      <SkeletonLine width="w-full" height="h-3" className="mb-2" />
      <SkeletonLine width="w-3/4" height="h-3" />
    </div>
  );
}
