'use client'

export default function KategoriLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-40 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
            <div className="h-10 w-10 bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
