import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { recordPaymentExternal } from '@/lib/db'

const API_URL = 'https://gate.chip-in.asia/api/v1/purchases/'
const WEBHOOK_URL = 'https://gate.chip-in.asia/api/v1/webhooks/'

async function ensureWebhook(secret: string) {
  const base = process.env.PUBLIC_URL || 'http://localhost:3000'
  const callback = `${base}/api/wallet/chip/callback`
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Boss Auto Wallet', events: ['purchase.paid'], callback })
    })
  } catch {}
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  const body = await req.json()
  const amount = Number(body.amount || 0)
  if (!(amount > 0)) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const secret = process.env.CHIP_SECRET_KEY || ''
  const brand = process.env.CHIP_BRAND_ID || ''
  const success_redirect = process.env.CHIP_SUCCESS_REDIRECT || ''
  const failure_redirect = process.env.CHIP_FAILURE_REDIRECT || ''
  const cancel_redirect = process.env.CHIP_CANCEL_REDIRECT || ''

  await ensureWebhook(secret)

  const chipAmount = Math.round(amount * 100)
  const payload = {
    brand_id: brand,
    client: { email },
    purchase: {
      currency: 'MYR',
      products: [ { name: 'Wallet Topup', quantity: 1, price: chipAmount, category: 'wallet' } ],
      total: chipAmount,
      notes: 'Boss Auto wallet topup'
    },
    success_redirect,
    failure_redirect,
    cancel_redirect,
    platform: 'web',
    product: 'purchases'
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: 'chip_error', details: err }, { status: 500 })
  }
  const data = await res.json()
  const providerId = data.id as string
  const checkoutUrl = data.checkout_url as string

  await recordPaymentExternal(userId, amount, providerId)
  return NextResponse.json({ ok: true, providerId, checkoutUrl })
}
