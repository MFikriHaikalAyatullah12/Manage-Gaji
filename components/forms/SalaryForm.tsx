'use client'

import { useState } from 'react'
import { FiX, FiSave, FiDollarSign, FiGift, FiMinus } from 'react-icons/fi'
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/formatRupiah'

interface SalaryFormProps {
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
  initialData?: {
    id?: string
    gajiPokok?: number
    tunjangan?: number | null
    bonus?: number | null
    potongan?: number | null
  }
}

export function SalaryForm({ onSubmit, onClose, initialData }: SalaryFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    gajiPokok: initialData?.gajiPokok ? formatCurrencyInput(initialData.gajiPokok) : '',
    tunjangan: initialData?.tunjangan ? formatCurrencyInput(initialData.tunjangan) : '',
    bonus: initialData?.bonus ? formatCurrencyInput(initialData.bonus) : '',
    potongan: initialData?.potongan ? formatCurrencyInput(initialData.potongan) : '',
  })

  // Calculate total from formatted values
  const total = parseCurrencyInput(formData.gajiPokok) + 
                parseCurrencyInput(formData.tunjangan) + 
                parseCurrencyInput(formData.bonus) - 
                parseCurrencyInput(formData.potongan)

  const [error, setError] = useState<string | null>(null)

  const handleFieldChange = (field: string, value: string) => {
    const formatted = formatCurrencyInput(value)
    setFormData({ ...formData, [field]: formatted })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit({
        gajiPokok: parseCurrencyInput(formData.gajiPokok),
        tunjangan: formData.tunjangan ? parseCurrencyInput(formData.tunjangan) : null,
        bonus: formData.bonus ? parseCurrencyInput(formData.bonus) : null,
        potongan: formData.potongan ? parseCurrencyInput(formData.potongan) : null,
      })
      onClose()
    } catch (error: any) {
      console.error('Error submitting salary:', error)
      setError(error.message || 'Gagal menyimpan gaji')
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData?.id ? 'Edit Gaji' : 'Atur Gaji'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Gaji Pokok & Tunjangan Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <FiDollarSign className="inline mr-1" size={12} />
                Gaji Pokok *
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.gajiPokok}
                onChange={(e) => handleFieldChange('gajiPokok', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <FiGift className="inline mr-1" size={12} />
                Tunjangan
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.tunjangan}
                onChange={(e) => handleFieldChange('tunjangan', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Bonus & Potongan Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <FiGift className="inline mr-1" size={12} />
                Bonus
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.bonus}
                onChange={(e) => handleFieldChange('bonus', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <FiMinus className="inline mr-1" size={12} />
                Potongan
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.potongan}
                onChange={(e) => handleFieldChange('potongan', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Total Preview */}
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex justify-between items-center">
              <span className="text-purple-700 text-sm font-medium">Total Gaji Bersih</span>
              <span className="text-lg font-bold text-purple-600">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            <FiSave size={16} />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  )
}
