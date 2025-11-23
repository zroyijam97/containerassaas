import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { listTransactions } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const rows = await listTransactions(userId)
  return NextResponse.json({ rows })
}
