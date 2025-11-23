import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDigitalGoodBySlug, purchaseProductWithWallet } from '@/lib/db'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect('/sign-in')
  const form = await req.formData()
  const slug = String(form.get('slug') || '')
  const data = await getDigitalGoodBySlug(slug)
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const price = Number(data.price)
  const r = await purchaseProductWithWallet(userId, Number(data.product_id), price)
  if (!r.ok) return NextResponse.redirect('/dashboard/billing?status=insufficient')
  return NextResponse.redirect('/dashboard/digital-products?status=success')
}
