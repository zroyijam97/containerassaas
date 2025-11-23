import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getBalance } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const balance = await getBalance(userId)
  return NextResponse.json({ balance })
}
