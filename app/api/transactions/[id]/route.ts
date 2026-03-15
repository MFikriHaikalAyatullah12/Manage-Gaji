import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactionService'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await getTransactionById(params.id)
    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const existing = await getTransactionById(params.id)
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const data = await request.json()
    const transaction = await updateTransaction(params.id, {
      tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId,
      note: data.note,
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const existing = await getTransactionById(params.id)
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    await deleteTransaction(params.id)
    return NextResponse.json({ message: 'Transaksi berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
