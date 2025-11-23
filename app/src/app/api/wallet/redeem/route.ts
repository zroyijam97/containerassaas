import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { redeem } from '@/lib/db'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const code = String(body.code || '')
  const r = await redeem(userId, code)
  if (!r.ok) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  return NextResponse.json({ ok: true, amount: r.amount })
}
