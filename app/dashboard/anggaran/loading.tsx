'use client'

export default function AnggaranLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-72 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 w-full bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Form Skeleton */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="h-6 w-36 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}
