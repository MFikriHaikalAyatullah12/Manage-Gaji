'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FiCalendar, FiRefreshCw } from 'react-icons/fi'
import { StatCard, BalanceCard, DailyAverageCard } from '@/components/cards/StatCard'
import { ExpensePieChart, TrendLineChart, IncomeExpenseBarChart } from '@/components/charts/Charts'
import { getMonthName } from '@/utils/formatRupiah'

interface DashboardData {
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
  budgetStatus: Array<{
    id: string
    category: {
      name: string
    }
    limitAmount: number
    spent: number
    percentage: number
    isOverBudget: boolean
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

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?month=${selectedMonth}&year=${selectedYear}`)
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedYear])

  const years = []
  for (let i = new Date().getFullYear() - 2; i <= new Date().getFullYear() + 1; i++) {
    years.push(i)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Selamat datang, {session?.user?.name || 'User'}!
        </p>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm flex-1 sm:flex-initial">
            <FiCalendar className="text-gray-400" size={16} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent outline-none text-gray-700 text-sm flex-1"
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
              className="bg-transparent outline-none text-gray-700 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchData}
            className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            title="Refresh"
          >
            <FiRefreshCw className="text-gray-600" size={16} />
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {data?.salaryComparison.isOverBudget && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">⚠️</span>
          </div>
          <div>
            <p className="font-semibold text-red-800 text-sm">Peringatan Keuangan</p>
            <p className="text-red-600 text-xs">
              Total pengeluaran bulan ini melebihi gaji pokok!
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          title="Pemasukan"
          amount={data?.totals.income || 0}
          type="income"
          subtitle={`${getMonthName(selectedMonth)}`}
        />
        <StatCard
          title="Pengeluaran"
          amount={data?.totals.expense || 0}
          type="expense"
          subtitle={`${getMonthName(selectedMonth)}`}
        />
        <StatCard
          title="Gaji Pokok"
          amount={data?.salaryComparison.salaryAmount || 0}
          type="salary"
          subtitle="Bulan ini"
        />
        <StatCard
          title="Saldo"
          amount={data?.salaryComparison.selisih || 0}
          type="balance"
          warning={data?.salaryComparison.isOverBudget}
          subtitle={data?.salaryComparison.selisih && data.salaryComparison.selisih < 0 ? 'Defisit' : 'Surplus'}
        />
      </div>

      {/* Balance & Daily Average Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <BalanceCard
          salary={data?.salaryComparison.salaryAmount || 0}
          expense={data?.salaryComparison.expenseAmount || 0}
          selisih={data?.salaryComparison.selisih || 0}
          isOverBudget={data?.salaryComparison.isOverBudget || false}
        />
        <DailyAverageCard
          totalExpense={data?.totals.expense || 0}
          daysElapsed={data?.dailyStats.daysElapsed || 1}
          daysInMonth={data?.dailyStats.daysInMonth || 30}
        />
      </div>

      {/* Budget Status */}
      {data?.budgetStatus && data.budgetStatus.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-card mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Status Anggaran</h3>
          <div className="space-y-3">
            {data.budgetStatus.map((budget) => (
              <div key={budget.id} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">{budget.category.name}</span>
                  <span className={`text-xs font-medium ${budget.isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budget.isOverBudget ? 'bg-red-500' : budget.percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ExpensePieChart data={data?.categoryExpenses || []} />
        <TrendLineChart data={data?.monthlyTrend || []} />
      </div>

      <div className="mb-6">
        <IncomeExpenseBarChart data={data?.monthlyTrend || []} />
      </div>
    </div>
  )
}
