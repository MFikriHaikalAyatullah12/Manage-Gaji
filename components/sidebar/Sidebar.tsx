'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  FiHome,
  FiDollarSign,
  FiPieChart,
  FiFolder,
  FiTarget,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiTrendingDown,
} from 'react-icons/fi'
import { useState } from 'react'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Pengeluaran', href: '/dashboard/transaksi', icon: FiTrendingDown },
  { name: 'Gaji Pokok', href: '/dashboard/gaji', icon: FiDollarSign },
  { name: 'Kategori', href: '/dashboard/kategori', icon: FiFolder },
  { name: 'Anggaran Bulanan', href: '/dashboard/anggaran', icon: FiTarget },
  { name: 'Laporan Keuangan', href: '/dashboard/laporan', icon: FiFileText },
  { name: 'Pengaturan Akun', href: '/dashboard/pengaturan', icon: FiSettings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <FiPieChart className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Keuangan</h1>
              <p className="text-xs text-gray-500">Pengelola Keuangan</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
