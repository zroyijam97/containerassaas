import { NextResponse } from 'next/server'
import { markPaymentPaid } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })
  const secret = process.env.CHIP_SECRET_KEY || ''
  const r = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${id}/`, {
    headers: { Authorization: `Bearer ${secret}` }
  })
  if (!r.ok) return NextResponse.json({ error: 'chip_error' }, { status: 500 })
  const data = await r.json()
  if (data?.status === 'paid') {
    await markPaymentPaid(id)
  }
  return NextResponse.json({ status: data?.status || 'unknown' })
}
