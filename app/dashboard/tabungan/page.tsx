'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiCalendar, FiSave, FiTrash2, FiTrendingUp, FiDollarSign, FiArrowDown, FiCheck } from 'react-icons/fi'
import { formatRupiah, getMonthName, formatCurrencyInput, parseCurrencyInput } from '@/utils/formatRupiah'

interface Saving {
  id: string
  amount: number
  month: number
  year: number
  note: string | null
  createdAt: string
}

interface SavingsOverview {
  salaryAmount: number
  expenseAmount: number
  remainingFromSalary: number
  savedThisMonth: number
  totalSavings: number
  allSavings: Saving[]
  canSave: boolean
}

export default function TabunganPage() {
  const [overview, setOverview] = useState<SavingsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [saveAmount, setSaveAmount] = useState('')
  const [saveNote, setSaveNote] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/savings?action=overview&month=${selectedMonth}&year=${selectedYear}`)
      const data = await res.json()
      setOverview(data)
    } catch (error) {
      console.error('Error fetching savings overview:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const amount = parseCurrencyInput(saveAmount)
      if (amount <= 0) {
        alert('Masukkan jumlah tabungan yang valid')
        setSaving(false)
        return
      }

      await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          month: selectedMonth,
          year: selectedYear,
          note: saveNote || null,
        }),
      })

      setSaveAmount('')
      setSaveNote('')
      setShowSaveForm(false)
      fetchOverview()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tabungan ini?')) return
    try {
      await fetch(`/api/savings/${id}`, { method: 'DELETE' })
      fetchOverview()
    } catch (error) {
      console.error('Error deleting saving:', error)
    }
  }

  const handleSaveAll = async () => {
    if (!overview || overview.remainingFromSalary <= 0) return
    
    setSaving(true)
    try {
      await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: overview.remainingFromSalary,
          month: selectedMonth,
          year: selectedYear,
          note: 'Sisa gaji bulan ini',
        }),
      })
      fetchOverview()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const years = []
  for (let i = new Date().getFullYear() - 2; i <= new Date().getFullYear() + 1; i++) {
    years.push(i)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Tabungan</h1>
          <p className="text-gray-500 mt-1">Kelola sisa gaji dan tabungan bulanan Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm">
            <FiCalendar className="text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent outline-none text-gray-700"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent outline-none text-gray-700"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Savings Card */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiSave size={28} />
            </div>
            <div>
              <p className="text-green-100">Total Tabungan</p>
              <p className="text-2xl font-bold">{formatRupiah(overview?.totalSavings || 0)}</p>
            </div>
          </div>
        </div>

        {/* Salary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiDollarSign size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Gaji Bulan Ini</p>
              <p className="text-xl font-bold text-gray-800">{formatRupiah(overview?.salaryAmount || 0)}</p>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiArrowDown size={24} className="text-red-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pengeluaran</p>
              <p className="text-xl font-bold text-gray-800">{formatRupiah(overview?.expenseAmount || 0)}</p>
            </div>
          </div>
        </div>

        {/* Remaining Card */}
        <div className={`rounded-2xl p-6 shadow-card ${
          (overview?.remainingFromSalary || 0) >= 0 
            ? 'bg-white' 
            : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              (overview?.remainingFromSalary || 0) >= 0 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              <FiTrendingUp size={24} className={
                (overview?.remainingFromSalary || 0) >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              } />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Sisa Gaji</p>
              <p className={`text-xl font-bold ${
                (overview?.remainingFromSalary || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatRupiah(overview?.remainingFromSalary || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Section */}
      {overview?.canSave && overview.remainingFromSalary > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-6 border border-blue-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiSave className="text-green-500" />
                Sisa Gaji Tersedia
              </h3>
              <p className="text-gray-600 mt-1">
                Anda memiliki sisa {formatRupiah(overview.remainingFromSalary)} dari gaji bulan {getMonthName(selectedMonth)} {selectedYear}.
                {overview.savedThisMonth > 0 && (
                  <span className="text-green-600 font-medium"> (Sudah ditabung: {formatRupiah(overview.savedThisMonth)})</span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveForm(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-green-500 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors"
              >
                <FiSave />
                Tabung Sebagian
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50"
              >
                {saving ? (
                  <div className="spinner-sm"></div>
                ) : (
                  <FiCheck />
                )}
                Tabung Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Savings History */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Tabungan</h2>
        
        {overview?.allSavings && overview.allSavings.length > 0 ? (
          <div className="space-y-4">
            {overview.allSavings.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiSave className="text-green-500" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {getMonthName(s.month)} {s.year}
                    </p>
                    {s.note && <p className="text-sm text-gray-500">{s.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-green-600">
                    {formatRupiah(s.amount)}
                  </p>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FiSave size={48} className="mx-auto mb-3 opacity-50" />
            <p>Belum ada tabungan</p>
            <p className="text-sm mt-1">Mulai menabung dari sisa gaji Anda</p>
          </div>
        )}
      </div>

      {/* Save Form Modal */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Tambah Tabungan</h2>
              <button
                onClick={() => setShowSaveForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Tabungan
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={saveAmount}
                  onChange={(e) => setSaveAmount(formatCurrencyInput(e.target.value))}
                  placeholder="Masukkan jumlah"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal: {formatRupiah(overview?.remainingFromSalary || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={saveNote}
                  onChange={(e) => setSaveNote(e.target.value)}
                  placeholder="Catatan tabungan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
