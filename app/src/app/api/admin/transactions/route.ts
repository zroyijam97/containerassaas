import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { listAllTransactions } from '@/lib/db'

export async function GET() {
  const user = await currentUser()
  const adminEmail = process.env.ADMIN_EMAIL || ''
  const isAdmin = !!user && user.emailAddresses?.some(e => e.emailAddress === adminEmail)
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const rows = await listAllTransactions()
  return NextResponse.json({ rows })
}
