import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createLandingPage, listLandingPages, getLandingPage, updateLandingPage } from '@/lib/db'

function isAdminUser(user: { emailAddresses?: { emailAddress: string }[] } | null) {
  const adminEmail = process.env.ADMIN_EMAIL || ''
  return !!user && user.emailAddresses?.some((e) => e.emailAddress === adminEmail)
}

export async function GET(req: Request) {
  const user = await currentUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const id = Number(url.searchParams.get('id') || 0)
  if (id > 0) {
    const row = await getLandingPage(id)
    return NextResponse.json({ row })
  }
  const rows = await listLandingPages()
  return NextResponse.json({ rows })
}

export async function POST(req: Request) {
  const user = await currentUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const title = String(body.title||'')
  const slug = String(body.slug||'')
  const html = String(body.html||'')
  if (!title || !slug || !html) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const id = await createLandingPage(title, slug, html)
  return NextResponse.json({ ok:true, id })
}

export async function PUT(req: Request) {
  const user = await currentUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const id = Number(body.id||0)
  const title = String(body.title||'')
  const slug = String(body.slug||'')
  const html = String(body.html||'')
  if (!(id>0) || !title || !slug || !html) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  await updateLandingPage(id, title, slug, html)
  return NextResponse.json({ ok: true })
}
