'use client'

import { useState } from 'react'
import { FiX, FiSave, FiCalendar, FiDollarSign, FiFileText, FiTag } from 'react-icons/fi'
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/formatRupiah'

interface Category {
  id: string
  name: string
  icon?: string | null
  color?: string | null
}

interface TransactionFormProps {
  categories: Category[]
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
  initialData?: {
    id?: string
    tanggal?: string
    amount?: number
    categoryId?: string
    note?: string
  }
}

export function TransactionForm({
  categories,
  onSubmit,
  onClose,
  initialData,
}: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tanggal: initialData?.tanggal || new Date().toISOString().split('T')[0],
    amount: initialData?.amount ? formatCurrencyInput(initialData.amount) : '',
    type: 'expense', // Always expense
    categoryId: initialData?.categoryId || '',
    note: initialData?.note || '',
  })

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value)
    setFormData({ ...formData, amount: formatted })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        amount: parseCurrencyInput(formData.amount),
      })
      onClose()
    } catch (error) {
      console.error('Error submitting transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData?.id ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Date & Amount Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <FiCalendar className="inline mr-1" size={12} />
                Tanggal
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <FiDollarSign className="inline mr-1" size={12} />
                Jumlah (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <FiTag className="inline mr-1" size={12} />
              Kategori
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <FiFileText className="inline mr-1" size={12} />
              Catatan (opsional)
            </label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Catatan tambahan..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <FiSave size={16} />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  )
}
