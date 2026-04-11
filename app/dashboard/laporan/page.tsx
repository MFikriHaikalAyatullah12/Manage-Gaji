'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiCalendar, FiDownload, FiFileText, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { ExpensePieChart, ExpenseBarChart } from '@/components/charts/Charts'
import { formatRupiah, getMonthName } from '@/utils/formatRupiah'
import { generateMonthlyReport } from '@/utils/generatePDF'
import { useNotification } from '@/contexts/NotificationContext'

interface Transaction {
  id: string
  tanggal: string
  amount: number
  type: string
  note: string | null
  category: {
    id: string
    name: string
    color: string | null
  } | null
}

interface ReportData {
  totals: {
    income: number
    expense: number
  }
  salaryComparison: {
    salaryAmount: number
    expenseAmount: number
    selisih: number
    isOverBudget: boolean
  }
  categoryExpenses: Array<{
    category: {
      id: string
      name: string
      color: string | null
    } | null
    amount: number
  }>
  monthlyTrend: Array<{
    month: number
    income: number
    expense: number
  }>
  dailyStats: {
    dailyAverage: number
    projectedMonthly: number
    daysElapsed: number
    daysInMonth: number
  }
}

interface SavingsData {
  id: string
  amount: number
  month: number
  year: number
  note: string | null
}

export default function LaporanPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savings, setSavings] = useState<SavingsData | null>(null)
  const [totalSavings, setTotalSavings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { success, error: showError } = useNotification()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch report data, transactions, and savings in parallel
      const [reportRes, transRes, savingsRes, totalSavingsRes] = await Promise.all([
        fetch(`/api/dashboard?month=${selectedMonth}&year=${selectedYear}`),
        fetch(`/api/transactions?month=${selectedMonth}&year=${selectedYear}&type=expense&limit=1000`),
        fetch(`/api/savings?month=${selectedMonth}&year=${selectedYear}`),
        fetch(`/api/savings?action=total`)
      ])
      
      const reportData = await reportRes.json()
      const transData = await transRes.json()
      const savingsData = await savingsRes.json()
      const totalSavingsData = await totalSavingsRes.json()
      
      setData(reportData)
      setTransactions(transData.transactions || [])
      
      // Find savings for selected month
      const monthlySaving = Array.isArray(savingsData) 
        ? savingsData.find((s: SavingsData) => s.month === selectedMonth && s.year === selectedYear)
        : null
      setSavings(monthlySaving || null)
      setTotalSavings(totalSavingsData.total || 0)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDownloadPDF = async () => {
    if (!data) return
    
    setDownloading(true)
    try {
      generateMonthlyReport(
        data, 
        transactions, 
        selectedMonth, 
        selectedYear, 
        undefined,
        { monthlySaving: savings?.amount || 0, totalSavings }
      )
      success('Berhasil!', `Laporan ${getMonthName(selectedMonth)} ${selectedYear} berhasil diunduh`)
    } catch (err) {
      console.error('Error generating PDF:', err)
      showError('Gagal!', 'Terjadi kesalahan saat membuat PDF')
    } finally {
      setDownloading(false)
    }
  }

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const years = []
  for (let i = new Date().getFullYear() - 2; i <= new Date().getFullYear() + 1; i++) {
    years.push(i)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Laporan Keuangan</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan keuangan bulanan Anda</p>
        
        {/* Month Navigation - Full width on mobile */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 shadow-sm">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Bulan Sebelumnya"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400 hidden sm:block" size={16} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent outline-none text-gray-700 font-medium text-sm"
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
                className="bg-transparent outline-none text-gray-700 font-medium text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Bulan Berikutnya"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
          
          {/* Download PDF Button - Full width on mobile */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloading || !data}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/30 disabled:opacity-50 text-sm"
          >
            <FiDownload size={18} />
            {downloading ? 'Mengunduh...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 sm:p-5 text-white">
          <p className="text-purple-100 text-xs sm:text-sm mb-1">Gaji Pokok</p>
          <p className="text-lg sm:text-2xl font-bold">{formatRupiah(data?.salaryComparison.salaryAmount || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-4 sm:p-5 text-white">
          <p className="text-red-100 text-xs sm:text-sm mb-1">Total Pengeluaran</p>
          <p className="text-lg sm:text-2xl font-bold">{formatRupiah(data?.totals.expense || 0)}</p>
        </div>
        <div className={`bg-gradient-to-br ${(data?.salaryComparison.selisih || 0) >= 0 ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'} rounded-xl p-4 sm:p-5 text-white`}>
          <p className={(data?.salaryComparison.selisih || 0) >= 0 ? 'text-green-100 text-xs sm:text-sm mb-1' : 'text-red-100 text-xs sm:text-sm mb-1'}>Sisa Gaji</p>
          <p className="text-lg sm:text-2xl font-bold">{formatRupiah(data?.salaryComparison.selisih || 0)}</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Financial Summary */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiFileText className="text-blue-600" size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Ringkasan Keuangan</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600 text-sm">Gaji Pokok</span>
              <span className="font-semibold text-purple-600 text-sm">
                {formatRupiah(data?.salaryComparison.salaryAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600 text-sm">Total Pengeluaran</span>
              <span className="font-semibold text-red-600 text-sm">
                {formatRupiah(data?.totals.expense || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600 text-sm">Sisa Gaji</span>
              <span className={`font-semibold text-sm ${(data?.salaryComparison.selisih || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatRupiah(data?.salaryComparison.selisih || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600 text-sm">Rata-rata/Hari</span>
              <span className="font-semibold text-orange-600 text-sm">
                {formatRupiah(data?.dailyStats.dailyAverage || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600 text-sm">Jumlah Transaksi</span>
              <span className="font-semibold text-gray-800 text-sm">
                {transactions.length} transaksi
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Proyeksi Bulanan</span>
              <span className="font-semibold text-gray-800 text-sm">
                {formatRupiah(data?.dailyStats.projectedMonthly || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Distribution */}
        <ExpensePieChart data={data?.categoryExpenses || []} />
      </div>

      {/* Monthly Trend Chart */}
      <div className="mb-6">
        <ExpenseBarChart data={data?.monthlyTrend || []} />
      </div>

      {/* Category Breakdown */}
      {data?.categoryExpenses && data.categoryExpenses.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Pengeluaran per Kategori</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Persentase
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.categoryExpenses.map((item, index) => {
                  const totalExpense = data.totals.expense || 1
                  const percentage = (item.amount / totalExpense) * 100
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.category?.color || '#6b7280' }}
                          />
                          <span className="text-gray-700">{item.category?.name || 'Lainnya'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        {formatRupiah(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {percentage.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
