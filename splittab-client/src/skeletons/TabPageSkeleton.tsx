export default function TabPageSkeleton() {
  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto animate-pulse">
      {/* header */}
      <div className="bg-emerald-500 px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-3 w-16 bg-white/30 rounded mb-2" />
            <div className="h-5 w-32 bg-white/30 rounded" />
          </div>
          <div className="h-10 w-16 bg-white/30 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/15 rounded-xl p-3 h-14" />
          <div className="flex-1 bg-white/15 rounded-xl p-3 h-14" />
          <div className="flex-1 bg-white/15 rounded-xl p-3 h-14" />
        </div>
      </div>

      {/* members row */}
      <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-gray-100" />
        ))}
        <div className="h-3 w-20 bg-gray-100 rounded ml-1" />
      </div>

      {/* tabs */}
      <div className="flex border-b border-gray-100">
        <div className="flex-1 py-3 flex justify-center">
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
        <div className="flex-1 py-3 flex justify-center">
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>

      {/* expense rows */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-4 border-b border-gray-50"
        >
          <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-32 bg-gray-100 rounded mb-2" />
            <div className="h-2.5 w-24 bg-gray-50 rounded" />
          </div>
          <div className="text-right">
            <div className="h-3 w-12 bg-gray-100 rounded mb-2" />
            <div className="h-2.5 w-10 bg-gray-50 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
