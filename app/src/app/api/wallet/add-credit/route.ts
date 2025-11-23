import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { addCredit } from '@/lib/db'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const amount = Number(body.amount || 0)
  if (!(amount > 0)) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  await addCredit(userId, amount, 'credit')
  return NextResponse.json({ ok: true })
}
