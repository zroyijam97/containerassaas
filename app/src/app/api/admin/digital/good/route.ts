import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createDigitalGood } from '@/lib/db'

function isAdminUser(user: { emailAddresses?: { emailAddress: string }[] } | null) {
  const adminEmail = process.env.ADMIN_EMAIL || ''
  return !!user && user.emailAddresses?.some((e) => e.emailAddress === adminEmail)
}

export async function POST(req: Request) {
  const user = await currentUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const b = await req.json()
  const landing_page_id = Number(b.landing_page_id||0)
  const product_id = Number(b.product_id||0)
  const slug = String(b.slug||'')
  if (!(landing_page_id>0) || !(product_id>0) || !slug) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const id = await createDigitalGood(landing_page_id, product_id, slug)
  return NextResponse.json({ ok:true, id })
}
