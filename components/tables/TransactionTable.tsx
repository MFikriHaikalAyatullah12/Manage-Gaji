'use client'

import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { formatRupiah, formatDateShort } from '@/utils/formatRupiah'

export interface Transaction {
  id: string
  tanggal: string
  amount: number
  type: 'income' | 'expense'
  note?: string | null
  category?: {
    id: string
    name: string
    color?: string | null
  } | null
}

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card text-center">
        <div className="text-gray-400">Belum ada pengeluaran</div>
        <p className="text-gray-400 text-sm mt-1">Mulai catat pengeluaran Anda</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="bg-white rounded-xl p-3 shadow-card flex items-center gap-3"
        >
          {/* Color indicator */}
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0"
            style={{ backgroundColor: transaction.category?.color || '#6b7280' }}
          />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800 text-sm truncate">
                {transaction.category?.name || 'Lainnya'}
              </span>
              <span className="text-red-600 font-semibold text-sm">
                -{formatRupiah(transaction.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs text-gray-500 truncate">
                {transaction.note || formatDateShort(transaction.tanggal)}
              </span>
              <span className="text-xs text-gray-400">
                {formatDateShort(transaction.tanggal)}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FiEdit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
