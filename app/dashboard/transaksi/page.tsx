'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { TransactionTable, Transaction } from '@/components/tables/TransactionTable'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { getMonthName, formatRupiah } from '@/utils/formatRupiah'
import { useNotification } from '@/contexts/NotificationContext'

interface Category {
  id: string
  name: string
  color: string | null
}

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState('')
  const [total, setTotal] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [page, setPage] = useState(1)
  const { success, error: showError } = useNotification()

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: String(selectedMonth),
        year: String(selectedYear),
        page: String(page),
        limit: '20',
        type: 'expense', // Only fetch expenses
      })
      if (search) params.set('search', search)
      if (selectedCategory) params.set('categoryId', selectedCategory)

      const res = await fetch(`/api/transactions?${params}`)
      const data = await res.json()
      setTransactions(data.transactions)
      setTotal(data.total)
      
      // Calculate total amount
      const sum = data.transactions.reduce((acc: number, t: Transaction) => acc + t.amount, 0)
      setTotalAmount(sum)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear, search, selectedCategory, page])

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
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (formData: any) => {
    try {
      if (editingTransaction) {
        const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          success('Berhasil!', 'Pengeluaran berhasil diperbarui')
        } else {
          throw new Error('Failed to update')
        }
      } else {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          success('Berhasil!', 'Pengeluaran baru berhasil ditambahkan')
        } else {
          throw new Error('Failed to create')
        }
      }
      fetchTransactions()
      setEditingTransaction(null)
    } catch (err) {
      console.error('Error saving transaction:', err)
      showError('Gagal!', 'Terjadi kesalahan saat menyimpan pengeluaran')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) return
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        success('Berhasil!', 'Pengeluaran berhasil dihapus')
        fetchTransactions()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (err) {
      console.error('Error deleting transaction:', err)
      showError('Gagal!', 'Terjadi kesalahan saat menghapus pengeluaran')
    }
  }

  const years = []
  for (let i = new Date().getFullYear() - 2; i <= new Date().getFullYear() + 1; i++) {
    years.push(i)
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

  const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear()

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pengeluaran</h1>
          <p className="text-sm text-gray-500">{total} transaksi • Total: <span className="text-red-600 font-semibold">{formatRupiah(totalAmount)}</span></p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null)
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 text-sm"
        >
          <FiPlus size={18} />
          <span className="hidden sm:inline">Tambah Pengeluaran</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-3 shadow-card mb-4">
        <div className="flex flex-col gap-3">
          {/* Month Navigation - More prominent */}
          <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-red-100 rounded-lg px-3 py-2">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Bulan Sebelumnya"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="text-center">
              <span className="font-semibold text-gray-800">{getMonthName(selectedMonth)} {selectedYear}</span>
              {!isCurrentMonth && (
                <p className="text-xs text-gray-500">Riwayat bulan lalu</p>
              )}
            </div>
            <button 
              onClick={goToNextMonth}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Bulan Berikutnya"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1.5 text-sm flex-1">
              <FiFilter className="text-gray-400" size={14} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent outline-none text-gray-700 text-sm flex-1"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-white rounded-lg shadow-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg">
            {page}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 20 >= total}
            className="px-3 py-1.5 text-sm bg-white rounded-lg shadow-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false)
            setEditingTransaction(null)
          }}
          initialData={
            editingTransaction
              ? {
                  id: editingTransaction.id,
                  tanggal: new Date(editingTransaction.tanggal).toISOString().split('T')[0],
                  amount: editingTransaction.amount,
                  categoryId: editingTransaction.category?.id,
                  note: editingTransaction.note || '',
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
