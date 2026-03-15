'use client'

import { useState, useEffect } from 'react'
import { FiEdit2, FiDollarSign, FiGift, FiMinus } from 'react-icons/fi'
import { SalaryForm } from '@/components/forms/SalaryForm'
import { formatRupiah } from '@/utils/formatRupiah'

interface Salary {
  id: string
  gajiPokok: number
  tunjangan: number | null
  bonus: number | null
  potongan: number | null
  createdAt: string
}

export default function GajiPage() {
  const [salary, setSalary] = useState<Salary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchSalary = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/salary')
      const data = await res.json()
      console.log('fetchSalary response:', data)
      setSalary(data)
    } catch (error) {
      console.error('Error fetching salary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalary()
  }, [])

  const handleSubmit = async (formData: any) => {
    console.log('handleSubmit - Start, data:', formData)
    try {
      const res = await fetch('/api/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      console.log('handleSubmit - Response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Gagal menyimpan gaji')
      }
      
      const savedData = await res.json()
      console.log('handleSubmit - Saved data:', savedData)
      
      await fetchSalary()
      console.log('handleSubmit - fetchSalary completed')
    } catch (error) {
      console.error('Error saving salary:', error)
      throw error // Re-throw so the form can catch it
    }
  }

  // Calculate total salary
  const totalSalary = salary
    ? salary.gajiPokok + (salary.tunjangan || 0) + (salary.bonus || 0) - (salary.potongan || 0)
    : 0

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Gaji Pokok</h1>
          <p className="text-gray-500 mt-1">Kelola gaji pokok bulanan Anda</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/30"
        >
          <FiEdit2 />
          {salary ? 'Edit Gaji' : 'Atur Gaji'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : !salary ? (
        <div className="bg-white rounded-2xl p-8 shadow-card text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="text-purple-500" size={40} />
          </div>
          <div className="text-gray-600 text-lg font-medium">Belum ada data gaji</div>
          <p className="text-gray-400 text-sm mt-2 mb-6">
            Atur gaji pokok Anda untuk memulai tracking keuangan
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            Atur Gaji Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total Salary Card */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <FiDollarSign size={28} />
              </div>
              <div>
                <p className="text-purple-100">Total Gaji Bersih per Bulan</p>
                <p className="text-3xl font-bold">{formatRupiah(totalSalary)}</p>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800">Rincian Gaji</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Gaji Pokok */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Gaji Pokok</p>
                    <p className="text-xs text-gray-400">Pendapatan utama</p>
                  </div>
                </div>
                <span className="font-semibold text-purple-600">{formatRupiah(salary.gajiPokok)}</span>
              </div>

              {/* Tunjangan */}
              {salary.tunjangan && salary.tunjangan > 0 && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiGift className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Tunjangan</p>
                      <p className="text-xs text-gray-400">Tunjangan tetap</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">+ {formatRupiah(salary.tunjangan)}</span>
                </div>
              )}

              {/* Bonus */}
              {salary.bonus && salary.bonus > 0 && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiGift className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Bonus</p>
                      <p className="text-xs text-gray-400">Bonus tambahan</p>
                    </div>
                  </div>
                  <span className="font-semibold text-blue-600">+ {formatRupiah(salary.bonus)}</span>
                </div>
              )}

              {/* Potongan */}
              {salary.potongan && salary.potongan > 0 && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FiMinus className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Potongan</p>
                      <p className="text-xs text-gray-400">Pajak, BPJS, dll</p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-600">- {formatRupiah(salary.potongan)}</span>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <span className="font-semibold text-purple-800">Total Gaji Bersih</span>
                <span className="font-bold text-xl text-purple-600">{formatRupiah(totalSalary)}</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-700">
              <strong>Info:</strong> Gaji ini akan digunakan sebagai basis perbandingan dengan pengeluaran bulanan Anda. 
              Sistem akan mengirim notifikasi jika pengeluaran melebihi gaji bersih.
            </p>
          </div>
        </div>
      )}

      {/* Salary Form Modal */}
      {showForm && (
        <SalaryForm
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          initialData={
            salary
              ? {
                  id: salary.id,
                  gajiPokok: salary.gajiPokok,
                  tunjangan: salary.tunjangan,
                  bonus: salary.bonus,
                  potongan: salary.potongan,
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
