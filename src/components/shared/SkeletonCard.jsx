export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="flex gap-3">
          <div className="skeleton h-3 w-16 rounded-lg" />
          <div className="skeleton h-3 w-16 rounded-lg" />
        </div>
        <div className="skeleton h-5 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
