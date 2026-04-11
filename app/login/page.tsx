'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiEye, FiEyeOff, FiArrowRight, FiX } from 'react-icons/fi'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Masuk
          </h1>
          <p className="text-slate-400 mt-2">
            Kelola keuangan Anda
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                required
                suppressHydrationWarning
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all pr-12"
                required
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Memproses...
                </span>
              ) : (
                <>
                  Masuk
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              Lupa password?
            </button>
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Daftar
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Lupa Password</h3>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">
              Hubungi administrator untuk reset password, atau buat akun baru dengan email berbeda.
            </p>

            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
