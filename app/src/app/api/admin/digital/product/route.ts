import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createProduct, listProducts, getProduct, updateProduct, replaceProductVariations, replaceProductFiles, listProductVariations, listProductFiles } from '@/lib/db'

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
    const row = await getProduct(id)
    const variations = await listProductVariations(id)
    const files = await listProductFiles(id)
    return NextResponse.json({ row, variations, files })
  }
  const rows = await listProducts()
  return NextResponse.json({ rows })
}

export async function POST(req: Request) {
  const user = await currentUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const b = await req.json()
  const title = String(b.title||'')
  const price = Number(b.price||0)
  const stock = Number(b.stock||0)
  const affiliate_percent = Number(b.affiliate_percent||0)
  const file_url = String(b.file_url||'') || undefined
  const description = String(b.description||'') || undefined
  const instructions = String(b.instructions||'') || undefined
  const variationsRaw = (Array.isArray(b.variations) ? b.variations : []) as { name?: unknown; price?: unknown; stock?: unknown }[]
  const variations = variationsRaw.map(v=>({ name:String(v.name||''), price:Number(v.price||0), stock:Number(v.stock||0) })).filter(v=>v.name && v.price>0)
  const filesRaw = (Array.isArray(b.files) ? b.files : []) as { file_url?: unknown }[]
  const files = filesRaw.map(f=>({ file_url:String(f.file_url||'') })).filter(f=>!!f.file_url)
  if (!title || !(price>0)) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const id = await createProduct({ title, price, stock, affiliate_percent, file_url, description, instructions })
  if (variations.length) await replaceProductVariations(id, variations)
  if (files.length) await replaceProductFiles(id, files)
  return NextResponse.json({ ok:true, id })
}

export async function PUT(req: Request) {
  const user = await currentUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const b = await req.json()
  const id = Number(b.id||0)
  const title = String(b.title||'')
  const price = Number(b.price||0)
  const stock = Number(b.stock||0)
  const affiliate_percent = Number(b.affiliate_percent||0)
  const file_url = String(b.file_url||'') || undefined
  const description = String(b.description||'') || undefined
  const instructions = String(b.instructions||'') || undefined
  if (!(id>0) || !title || !(price>0)) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  await updateProduct({ id, title, price, stock, affiliate_percent, file_url, description, instructions })
  const variationsRaw2 = (Array.isArray(b.variations) ? b.variations : []) as { name?: unknown; price?: unknown; stock?: unknown }[]
  const variations = variationsRaw2.map(v=>({ name:String(v.name||''), price:Number(v.price||0), stock:Number(v.stock||0) })).filter(v=>v.name && v.price>0)
  const filesRaw2 = (Array.isArray(b.files) ? b.files : []) as { file_url?: unknown }[]
  const files = filesRaw2.map(f=>({ file_url:String(f.file_url||'') })).filter(f=>!!f.file_url)
  await replaceProductVariations(id, variations)
  await replaceProductFiles(id, files)
  return NextResponse.json({ ok:true })
}
