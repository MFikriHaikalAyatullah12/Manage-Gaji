'use client'

export default function PengaturanLoading() {
  return (
    <div className="animate-pulse max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
        <div className="h-6 w-36 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
