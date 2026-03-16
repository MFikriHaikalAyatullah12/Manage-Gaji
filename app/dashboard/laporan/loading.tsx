'use client'

export default function LaporanLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
            <div className="h-10 w-10 bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
