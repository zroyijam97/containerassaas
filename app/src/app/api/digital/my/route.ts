import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { listUserDigitalAccess } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const rows = await listUserDigitalAccess(userId)
  return NextResponse.json({ rows })
}
