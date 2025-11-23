import { NextResponse } from 'next/server'
import { markPaymentPaid } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const id = String(payload?.id || '')
    const status = String(payload?.status || '')
    if (!id) return NextResponse.json({ ok: false }, { status: 400 })
    if (status === 'paid') {
      await markPaymentPaid(id)
    }
    return NextResponse.json({ ok: true })
  } catch (_e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
