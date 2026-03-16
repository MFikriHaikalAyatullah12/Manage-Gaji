export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format angka dengan separator titik untuk input (1000000 -> 1.000.000)
export function formatCurrencyInput(value: string | number): string {
  // Hapus semua karakter non-digit
  const numStr = String(value).replace(/\D/g, '')
  if (!numStr) return ''
  
  // Format dengan titik sebagai thousand separator
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Parse formatted currency ke number (1.000.000 -> 1000000)
export function parseCurrencyInput(value: string): number {
  if (!value) return 0
  // Hapus semua titik dan parse ke number
  return parseInt(value.replace(/\./g, ''), 10) || 0
}

export function formatRupiahShort(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(1)}rb`
  }
  return `Rp ${amount}`
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[month - 1] || ''
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

export function getDaysElapsedInMonth(): number {
  return new Date().getDate()
}

export function calculateDailyAverage(total: number, days: number): number {
  if (days === 0) return 0
  return total / days
}
