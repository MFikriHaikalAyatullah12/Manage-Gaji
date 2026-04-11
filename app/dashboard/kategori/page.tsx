'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiTag } from 'react-icons/fi'

interface Category {
  id: string
  name: string
  color: string | null
}

const colorOptions = ['#f97316', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#22c55e', '#06b6d4', '#f59e0b', '#10b981', '#6b7280']

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#6b7280',
  })

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      fetchCategories()
      setShowForm(false)
      setEditingCategory(null)
      setFormData({ name: '', color: '#6b7280' })
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color || '#6b7280',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message)
        return
      }
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kategori</h1>
          <p className="text-gray-500 mt-1">Kelola kategori transaksi Anda</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', color: '#6b7280' })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
        >
          <FiPlus />
          Tambah Kategori
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-800">{category.name}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTag className="inline mr-2" />
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama kategori"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warna
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiSave />
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
