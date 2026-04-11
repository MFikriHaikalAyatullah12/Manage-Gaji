'use client'

import { useState } from 'react'
import { FiX, FiSave, FiDollarSign, FiCalendar, FiTag } from 'react-icons/fi'
import { getMonthName, formatCurrencyInput, parseCurrencyInput } from '@/utils/formatRupiah'

interface Category {
  id: string
  name: string
  color?: string | null
}

interface BudgetFormProps {
  categories: Category[]
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
  initialData?: {
    id?: string
    categoryId?: string
    limitAmount?: number
    month?: number
    year?: number
  }
}

export function BudgetForm({ categories, onSubmit, onClose, initialData }: BudgetFormProps) {
  const currentDate = new Date()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: initialData?.categoryId || '',
    limitAmount: initialData?.limitAmount ? formatCurrencyInput(initialData.limitAmount) : '',
    month: initialData?.month || currentDate.getMonth() + 1,
    year: initialData?.year || currentDate.getFullYear(),
  })

  const years = []
  for (let i = currentDate.getFullYear() - 1; i <= currentDate.getFullYear() + 1; i++) {
    years.push(i)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value)
    setFormData({ ...formData, limitAmount: formatted })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        limitAmount: parseCurrencyInput(formData.limitAmount),
      })
      onClose()
    } catch (error) {
      console.error('Error submitting budget:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData?.id ? 'Edit Anggaran' : 'Tambah Anggaran'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiTag className="inline mr-2" />
              Kategori
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Limit Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiDollarSign className="inline mr-2" />
              Batas Anggaran (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.limitAmount}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-2" />
                Bulan
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiSave />
            {loading ? 'Menyimpan...' : 'Simpan Anggaran'}
          </button>
        </form>
      </div>
    </div>
  )
}
