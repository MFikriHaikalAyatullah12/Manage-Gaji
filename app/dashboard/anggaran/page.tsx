'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiCalendar, FiTrash2, FiTarget, FiCopy } from 'react-icons/fi'
import { BudgetForm } from '@/components/forms/BudgetForm'
import { formatRupiah, getMonthName } from '@/utils/formatRupiah'

interface Category {
  id: string
  name: string
  icon: string | null
}

interface BudgetStatus {
  id: string
  categoryId: string
  limitAmount: number
  month: number
  year: number
  category: Category
  spent: number
  remaining: number
  percentage: number
  actualPercentage: number
  isOverBudget: boolean
}

export default function AnggaranPage() {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/budgets?action=status&month=${selectedMonth}&year=${selectedYear}`)
      const data = await res.json()
      setBudgets(data)
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (formData: any) => {
    try {
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      fetchBudgets()
    } catch (error) {
      console.error('Error saving budget:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) return
    try {
      await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      fetchBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const handleCopyToNextMonth = async () => {
    // Calculate next month info for confirmation message
    let nextMonth = selectedMonth + 1
    let nextYear = selectedYear
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear = selectedYear + 1
    }

    if (!confirm(`Salin semua anggaran dari ${getMonthName(selectedMonth)} ${selectedYear} ke ${getMonthName(nextMonth)} ${nextYear}?`)) return
    
    setCopying(true)
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'copy-to-next-month',
          fromMonth: selectedMonth,
          fromYear: selectedYear,
        }),
      })
      const result = await res.json()
      
      if (result.copied > 0) {
        alert(`Berhasil menyalin ${result.copied} anggaran ke ${getMonthName(result.toMonth)} ${result.toYear}${result.skipped > 0 ? ` (${result.skipped} sudah ada)` : ''}`)
      } else if (result.skipped > 0) {
        alert(`Semua anggaran sudah ada di ${getMonthName(result.toMonth)} ${result.toYear}`)
      } else {
        alert('Tidak ada anggaran untuk disalin')
      }
    } catch (error) {
      console.error('Error copying budgets:', error)
      alert('Gagal menyalin anggaran')
    } finally {
      setCopying(false)
    }
  }

  const years = []
  for (let i = new Date().getFullYear() - 1; i <= new Date().getFullYear() + 1; i++) {
    years.push(i)
  }

  // Calculate totals
  const totalBudget = budgets.reduce((acc, b) => acc + b.limitAmount, 0)
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0)

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Anggaran Bulanan</h1>
          <p className="text-gray-500 mt-1">Atur batas pengeluaran per kategori</p>
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
          <button
            onClick={handleCopyToNextMonth}
            disabled={copying || budgets.length === 0}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Salin anggaran ke bulan berikutnya"
          >
            {copying ? (
              <div className="spinner-sm"></div>
            ) : (
              <FiCopy />
            )}
            <span className="hidden sm:inline">Salin ke Bulan Berikutnya</span>
            <span className="sm:hidden">Salin</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
          >
            <FiPlus />
            Tambah Anggaran
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 shadow-lg mb-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <FiTarget size={28} />
          </div>
          <div>
            <p className="text-orange-100">
              Total Anggaran {getMonthName(selectedMonth)} {selectedYear}
            </p>
            <p className="text-3xl font-bold">{formatRupiah(totalBudget)}</p>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-white/20">
          <span className="text-orange-100">Terpakai</span>
          <span className="font-semibold">{formatRupiah(totalSpent)}</span>
        </div>
      </div>

      {/* Budgets List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-card text-center">
          <div className="text-gray-400 text-lg">Belum ada anggaran</div>
          <p className="text-gray-400 text-sm mt-2">
            Tambahkan anggaran bulanan untuk mengontrol pengeluaran
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className={`bg-white rounded-2xl p-6 shadow-card ${
                budget.isOverBudget ? 'ring-2 ring-red-400' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    {budget.category.icon || '📦'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{budget.category.name}</p>
                    <p className="text-sm text-gray-500">
                      Anggaran: {formatRupiah(budget.limitAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-semibold ${budget.isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatRupiah(budget.spent)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {budget.isOverBudget
                        ? `Melebihi ${formatRupiah(Math.abs(budget.remaining))}`
                        : `Sisa ${formatRupiah(budget.remaining)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budget.isOverBudget
                        ? 'bg-red-500'
                        : budget.percentage > 80
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500">{budget.actualPercentage.toFixed(1)}% terpakai</span>
                  {budget.isOverBudget && (
                    <span className="text-red-600 font-medium">Anggaran terlampaui!</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget Form Modal */}
      {showForm && (
        <BudgetForm
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          initialData={{
            month: selectedMonth,
            year: selectedYear,
          }}
        />
      )}
    </div>
  )
}
