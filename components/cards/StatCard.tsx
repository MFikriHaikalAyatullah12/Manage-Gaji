'use client'

import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiAlertTriangle } from 'react-icons/fi'
import { formatRupiah } from '@/utils/formatRupiah'

interface StatCardProps {
  title: string
  amount: number
  type: 'income' | 'expense' | 'balance' | 'salary'
  subtitle?: string
  trend?: number
  warning?: boolean
}

export function StatCard({ title, amount, type, subtitle, trend, warning }: StatCardProps) {
  const getConfig = () => {
    switch (type) {
      case 'income':
        return {
          icon: FiTrendingUp,
          bgColor: 'bg-gradient-to-br from-green-400 to-green-600',
          textColor: 'text-green-600',
          bgLight: 'bg-green-50',
        }
      case 'expense':
        return {
          icon: FiTrendingDown,
          bgColor: 'bg-gradient-to-br from-red-400 to-red-600',
          textColor: 'text-red-600',
          bgLight: 'bg-red-50',
        }
      case 'salary':
        return {
          icon: FiDollarSign,
          bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
          textColor: 'text-purple-600',
          bgLight: 'bg-purple-50',
        }
      default:
        return {
          icon: FiPieChart,
          bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
          textColor: 'text-blue-600',
          bgLight: 'bg-blue-50',
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <div className={`relative bg-white rounded-xl p-4 sm:p-6 shadow-card hover:shadow-card-hover transition-shadow ${warning ? 'ring-2 ring-red-400' : ''}`}>
      {warning && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full animate-pulse">
          <FiAlertTriangle size={14} />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">{title}</p>
          <p className={`text-sm sm:text-lg font-bold ${warning ? 'text-red-600' : 'text-gray-800'}`}>
            {formatRupiah(amount)}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
              <span>{Math.abs(trend).toFixed(1)}% dari bulan lalu</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-14 sm:h-14 ${config.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-3`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
    </div>
  )
}

interface BalanceCardProps {
  salary: number
  expense: number
  selisih: number
  isOverBudget: boolean
}

export function BalanceCard({ salary, expense, selisih, isOverBudget }: BalanceCardProps) {
  return (
    <div className={`bg-white rounded-xl p-4 sm:p-6 shadow-card hover:shadow-card-hover transition-shadow ${isOverBudget ? 'ring-2 ring-red-400' : ''}`}>
      {isOverBudget && (
        <div className="flex items-center gap-2 mb-3 p-2.5 bg-red-50 rounded-lg text-red-600">
          <FiAlertTriangle size={16} />
          <span className="text-xs sm:text-sm font-medium">Pengeluaran melebihi gaji!</span>
        </div>
      )}
      <h3 className="text-xs sm:text-sm text-gray-500 mb-3">Selisih Gaji vs Pengeluaran</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Gaji Pokok</span>
          <span className="font-semibold text-purple-600 text-sm">{formatRupiah(salary)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Total Pengeluaran</span>
          <span className="font-semibold text-red-600 text-sm">{formatRupiah(expense)}</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700 text-sm">Selisih</span>
            <span className={`text-base sm:text-xl font-bold ${selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {selisih >= 0 ? '+' : ''}{formatRupiah(selisih)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {selisih >= 0 ? 'Uang tersisa bulan ini' : 'Pengeluaran melebihi gaji'}
          </p>
        </div>
      </div>
    </div>
  )
}

interface DailyAverageCardProps {
  totalExpense: number
  daysElapsed: number
  daysInMonth: number
}

export function DailyAverageCard({ totalExpense, daysElapsed, daysInMonth }: DailyAverageCardProps) {
  const dailyAverage = daysElapsed > 0 ? totalExpense / daysElapsed : 0
  const projectedMonthly = dailyAverage * daysInMonth

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-card hover:shadow-card-hover transition-shadow">
      <h3 className="text-xs sm:text-sm text-gray-500 mb-3">Rata-rata Pengeluaran Harian</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{formatRupiah(dailyAverage)}</p>
          <p className="text-xs text-gray-400">per hari</p>
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-600">Total {daysElapsed} hari</span>
            <span className="font-medium">{formatRupiah(totalExpense)}</span>
          </div>
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-600">Proyeksi bulan ini</span>
            <span className="font-medium text-orange-600">{formatRupiah(projectedMonthly)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
