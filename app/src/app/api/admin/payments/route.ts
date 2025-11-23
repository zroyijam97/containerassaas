import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { listAllPayments } from '@/lib/db'

export async function GET() {
  const user = await currentUser()
  const adminEmail = process.env.ADMIN_EMAIL || ''
  const isAdmin = !!user && user.emailAddresses?.some(e => e.emailAddress === adminEmail)
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const rows = await listAllPayments()
  return NextResponse.json({ rows })
}
