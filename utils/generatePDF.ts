import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface CategoryExpense {
  category: {
    id: string
    name: string
    color: string | null
  } | null
  amount: number
}

interface ReportData {
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
  categoryExpenses: CategoryExpense[]
  dailyStats: {
    dailyAverage: number
    projectedMonthly: number
    daysElapsed: number
    daysInMonth: number
  }
}

interface Transaction {
  id: string
  tanggal: string
  amount: number
  type: string
  note: string | null
  category: {
    id: string
    name: string
    color: string | null
  } | null
}

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}

const getMonthName = (month: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[month - 1] || ''
}

interface SavingsInfo {
  monthlySaving: number
  totalSavings: number
}

export function generateMonthlyReport(
  data: ReportData,
  transactions: Transaction[],
  month: number,
  year: number,
  userName?: string,
  savingsInfo?: SavingsInfo
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN PENGELUARAN BULANAN', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(`${getMonthName(month)} ${year}`, pageWidth / 2, 30, { align: 'center' })
  
  if (userName) {
    doc.setFontSize(10)
    doc.text(`Nama: ${userName}`, 14, 40)
  }
  
  doc.setFontSize(10)
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 48)
  
  // Summary Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('RINGKASAN KEUANGAN', 14, 60)
  
  const summaryData = [
    ['Gaji Pokok', formatRupiah(data.salaryComparison.salaryAmount)],
    ['Total Pengeluaran', formatRupiah(data.totals.expense)],
    ['Selisih (Gaji - Pengeluaran)', formatRupiah(data.salaryComparison.selisih)],
    ['Tabungan Bulan Ini', formatRupiah(savingsInfo?.monthlySaving || 0)],
    ['Total Tabungan Terkumpul', formatRupiah(savingsInfo?.totalSavings || 0)],
    ['Rata-rata Pengeluaran/Hari', formatRupiah(data.dailyStats.dailyAverage)],
    ['Proyeksi Bulanan', formatRupiah(data.dailyStats.projectedMonthly)],
  ]
  
  autoTable(doc, {
    startY: 65,
    head: [['Keterangan', 'Jumlah']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14, right: 14 },
  })

  // Category Breakdown
  const finalY1 = (doc as any).lastAutoTable.finalY + 10
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PENGELUARAN PER KATEGORI', 14, finalY1)
  
  const categoryData = data.categoryExpenses.map((item) => {
    const totalExpense = data.totals.expense || 1
    const percentage = ((item.amount / totalExpense) * 100).toFixed(1)
    return [
      item.category?.name || 'Lainnya',
      formatRupiah(item.amount),
      `${percentage}%`
    ]
  })
  
  autoTable(doc, {
    startY: finalY1 + 5,
    head: [['Kategori', 'Jumlah', 'Persentase']],
    body: categoryData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14, right: 14 },
  })
  
  // Transaction Details - New Page
  doc.addPage()
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DETAIL TRANSAKSI', 14, 20)
  
  const transactionData = transactions.map((t) => [
    new Date(t.tanggal).toLocaleDateString('id-ID'),
    t.category?.name || '-',
    t.note || '-',
    formatRupiah(t.amount)
  ])
  
  autoTable(doc, {
    startY: 25,
    head: [['Tanggal', 'Kategori', 'Keterangan', 'Jumlah']],
    body: transactionData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 70 },
      3: { cellWidth: 35, halign: 'right' },
    },
  })
  
  // Footer with total
  const finalY2 = (doc as any).lastAutoTable.finalY + 10
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL PENGELUARAN: ${formatRupiah(data.totals.expense)}`, pageWidth - 14, finalY2, { align: 'right' })
  
  // Save the PDF
  const fileName = `Laporan_Pengeluaran_${getMonthName(month)}_${year}.pdf`
  doc.save(fileName)
  
  return fileName
}
