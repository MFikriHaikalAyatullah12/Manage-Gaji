'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Pie, Line, Bar } from 'react-chartjs-2'
import { formatRupiah } from '@/utils/formatRupiah'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface CategoryExpense {
  category: {
    id: string
    name: string
    color: string | null
  } | null
  amount: number
}

interface ExpensePieChartProps {
  data: CategoryExpense[]
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const chartData = {
    labels: data.map((item) => item.category?.name || 'Lainnya'),
    datasets: [
      {
        data: data.map((item) => item.amount),
        backgroundColor: data.map((item) => item.category?.color || '#6b7280'),
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 12,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${formatRupiah(value)} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-card">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Distribusi Pengeluaran</h3>
      <div className="h-56 sm:h-64">
        {data.length > 0 ? (
          <Pie data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Belum ada data pengeluaran
          </div>
        )}
      </div>
    </div>
  )
}

interface MonthlyTrend {
  month: number
  income: number
  expense: number
}

interface TrendLineChartProps {
  data: MonthlyTrend[]
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  const chartData = {
    labels: data.map((item) => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'Pengeluaran',
        data: data.map((item) => item.expense),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => formatRupiah(context.raw),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`
            if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
            return value
          },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-card">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Tren Pengeluaran Bulanan</h3>
      <div className="h-48 sm:h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

interface IncomeExpenseBarChartProps {
  data: MonthlyTrend[]
}

export function IncomeExpenseBarChart({ data }: IncomeExpenseBarChartProps) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  const chartData = {
    labels: data.map((item) => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'Pemasukan',
        data: data.map((item) => item.income),
        backgroundColor: '#22c55e',
        borderRadius: 8,
      },
      {
        label: 'Pengeluaran',
        data: data.map((item) => item.expense),
        backgroundColor: '#ef4444',
        borderRadius: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 12,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${formatRupiah(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`
            if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
            return value
          },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-card">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Pemasukan vs Pengeluaran</h3>
      <div className="h-48 sm:h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
