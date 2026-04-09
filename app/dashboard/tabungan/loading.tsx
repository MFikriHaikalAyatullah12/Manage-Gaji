'use client'

export default function TabunganLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-72 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Savings History */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                <div>
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-28 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}