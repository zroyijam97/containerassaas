import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

async function ensure() {
  await pool.query(`
    create table if not exists wallets (
      user_id text primary key,
      balance numeric not null default 0
    );
    create table if not exists transactions (
      id bigserial primary key,
      user_id text not null,
      type text not null,
      amount numeric not null,
      status text not null default 'completed',
      created_at timestamp not null default now()
    );
    create table if not exists payments (
      id bigserial primary key,
      user_id text not null,
      amount numeric not null,
      status text not null default 'pending',
      created_at timestamp not null default now()
    );
    alter table payments add column if not exists provider_id text;
    create unique index if not exists payments_provider_id_idx on payments(provider_id);
    create table if not exists landing_pages (
      id bigserial primary key,
      title text not null,
      slug text unique,
      html text not null,
      created_at timestamp not null default now()
    );
    create table if not exists products (
      id bigserial primary key,
      title text not null,
      price numeric not null,
      stock integer not null default 0,
      affiliate_percent numeric not null default 0,
      file_key text,
      file_url text,
      description text,
      instructions text,
      created_at timestamp not null default now()
    );
    alter table products add column if not exists description text;
    create table if not exists product_variations (
      id bigserial primary key,
      product_id bigint references products(id) on delete cascade,
      name text not null,
      price numeric not null,
      stock integer not null default 0,
      created_at timestamp not null default now()
    );
    create table if not exists product_files (
      id bigserial primary key,
      product_id bigint references products(id) on delete cascade,
      file_url text not null,
      created_at timestamp not null default now()
    );
    create table if not exists digital_goods (
      id bigserial primary key,
      landing_page_id bigint references landing_pages(id) on delete cascade,
      product_id bigint references products(id) on delete cascade,
      slug text unique,
      is_active boolean not null default true,
      created_at timestamp not null default now()
    );
    create table if not exists digital_access (
      id bigserial primary key,
      user_id text not null,
      product_id bigint not null,
      created_at timestamp not null default now(),
      unique(user_id, product_id)
    );
  `)
}

export async function getBalance(userId: string) {
  await ensure()
  const r = await pool.query('select balance from wallets where user_id=$1', [userId])
  if (!r.rows.length) return 0
  return Number(r.rows[0].balance)
}

export async function addCredit(userId: string, amount: number, type = 'credit') {
  await ensure()
  await pool.query('insert into wallets(user_id, balance) values($1,$2) on conflict(user_id) do update set balance=wallets.balance+$2', [userId, amount])
  await pool.query('insert into transactions(user_id,type,amount,status) values($1,$2,$3,$4)', [userId, type, amount, 'completed'])
}

export async function createTopup(userId: string, amount: number) {
  await ensure()
  const r = await pool.query('insert into payments(user_id,amount,status) values($1,$2,$3) returning id', [userId, amount, 'pending'])
  return r.rows[0].id as string
}

export async function listTransactions(userId: string) {
  await ensure()
  const r = await pool.query('select id,type,amount,status,created_at from transactions where user_id=$1 order by created_at desc limit 100', [userId])
  return r.rows
}

export async function listPayments(userId: string) {
  await ensure()
  const r = await pool.query('select id,amount,status,created_at from payments where user_id=$1 order by created_at desc limit 100', [userId])
  return r.rows
}

export async function redeem(userId: string, code: string) {
  const demo = process.env.VOUCHER_DEMO_CODE
  const amt = Number(process.env.VOUCHER_DEMO_AMOUNT || 0)
  if (code !== demo) return { ok: false }
  await addCredit(userId, amt, 'redeem')
  return { ok: true, amount: amt }
}

export async function recordPaymentExternal(userId: string, amount: number, providerId: string) {
  await ensure()
  await pool.query('insert into payments(user_id,amount,status,provider_id) values($1,$2,$3,$4) on conflict(provider_id) do nothing', [userId, amount, 'pending', providerId])
}

export async function markPaymentPaid(providerId: string) {
  await ensure()
  const r = await pool.query('update payments set status=$1 where provider_id=$2 returning user_id, amount', ['completed', providerId])
  if (r.rows.length) {
    const row = r.rows[0] as { user_id: string; amount: number | string }
    await addCredit(row.user_id, Number(row.amount), 'topup')
  }
}

export async function listAllTransactions() {
  await ensure()
  const r = await pool.query('select id, user_id, type, amount, status, created_at from transactions order by created_at desc limit 500')
  return r.rows
}

export async function listAllPayments() {
  await ensure()
  const r = await pool.query('select id, user_id, amount, status, provider_id, created_at from payments order by created_at desc limit 500')
  return r.rows
}

export async function createLandingPage(title: string, slug: string, html: string) {
  await ensure()
  const r = await pool.query('insert into landing_pages(title, slug, html) values($1,$2,$3) returning id', [title, slug, html])
  return r.rows[0].id as number
}

export async function listLandingPages() {
  await ensure()
  const r = await pool.query('select id,title,slug,html,created_at from landing_pages order by created_at desc limit 200')
  return r.rows
}

export async function getLandingPage(id: number) {
  await ensure()
  const r = await pool.query('select id,title,slug,html,created_at from landing_pages where id=$1', [id])
  return r.rows[0]
}

export async function updateLandingPage(id: number, title: string, slug: string, html: string) {
  await ensure()
  await pool.query('update landing_pages set title=$2, slug=$3, html=$4 where id=$1', [id, title, slug, html])
}

export async function createProduct(input: { title: string; price: number; stock: number; affiliate_percent: number; file_key?: string; file_url?: string; description?: string; instructions?: string }) {
  await ensure()
  const r = await pool.query('insert into products(title,price,stock,affiliate_percent,file_key,file_url,description,instructions) values($1,$2,$3,$4,$5,$6,$7,$8) returning id', [input.title, input.price, input.stock, input.affiliate_percent, input.file_key||null, input.file_url||null, input.description||null, input.instructions||null])
  return r.rows[0].id as number
}

export async function listProducts() {
  await ensure()
  const r = await pool.query('select id,title,price,stock,affiliate_percent,file_key,file_url,description,instructions,created_at from products order by created_at desc limit 200')
  return r.rows
}

export async function getProduct(id: number) {
  await ensure()
  const r = await pool.query('select id,title,price,stock,affiliate_percent,file_key,file_url,description,instructions,created_at from products where id=$1', [id])
  return r.rows[0]
}

export async function updateProduct(input: { id: number; title: string; price: number; stock: number; affiliate_percent: number; file_url?: string; description?: string; instructions?: string }) {
  await ensure()
  await pool.query('update products set title=$2, price=$3, stock=$4, affiliate_percent=$5, file_url=$6, description=$7, instructions=$8 where id=$1', [input.id, input.title, input.price, input.stock, input.affiliate_percent, input.file_url||null, input.description||null, input.instructions||null])
}

export async function replaceProductVariations(productId: number, variations: { name: string; price: number; stock: number }[]) {
  await ensure()
  await pool.query('delete from product_variations where product_id=$1', [productId])
  for (const v of variations) {
    await pool.query('insert into product_variations(product_id,name,price,stock) values($1,$2,$3,$4)', [productId, v.name, v.price, v.stock])
  }
}

export async function listProductVariations(productId: number) {
  await ensure()
  const r = await pool.query('select id,name,price,stock from product_variations where product_id=$1 order by created_at asc', [productId])
  return r.rows
}

export async function replaceProductFiles(productId: number, files: { file_url: string }[]) {
  await ensure()
  await pool.query('delete from product_files where product_id=$1', [productId])
  for (const f of files) {
    await pool.query('insert into product_files(product_id,file_url) values($1,$2)', [productId, f.file_url])
  }
}

export async function listProductFiles(productId: number) {
  await ensure()
  const r = await pool.query('select id,file_url from product_files where product_id=$1 order by created_at asc', [productId])
  return r.rows
}

export async function createDigitalGood(landing_page_id: number, product_id: number, slug: string) {
  await ensure()
  const r = await pool.query('insert into digital_goods(landing_page_id,product_id,slug,is_active) values($1,$2,$3,$4) returning id', [landing_page_id, product_id, slug, true])
  return r.rows[0].id as number
}

export async function getDigitalGoodBySlug(slug: string) {
  await ensure()
  const r = await pool.query('select dg.id,dg.slug,dg.is_active,p.id as product_id,p.title,p.price,p.file_url,p.instructions,lp.html from digital_goods dg join products p on dg.product_id=p.id join landing_pages lp on dg.landing_page_id=lp.id where dg.slug=$1', [slug])
  return r.rows[0]
}

export async function grantDigitalAccess(userId: string, productId: number) {
  await ensure()
  await pool.query('insert into digital_access(user_id,product_id) values($1,$2) on conflict(user_id,product_id) do nothing', [userId, productId])
}

export async function listUserDigitalAccess(userId: string) {
  await ensure()
  const r = await pool.query('select da.product_id, p.title, p.file_url, p.instructions from digital_access da join products p on da.product_id=p.id where da.user_id=$1 order by da.created_at desc', [userId])
  return r.rows
}

export async function purchaseProductWithWallet(userId: string, productId: number, price: number) {
  await ensure()
  const r = await pool.query('update wallets set balance=balance-$2 where user_id=$1 and balance>=$2 returning balance', [userId, price])
  if (!r.rows.length) return { ok: false, error: 'insufficient' }
  await pool.query('insert into transactions(user_id,type,amount,status) values($1,$2,$3,$4)', [userId, 'purchase', price, 'completed'])
  await grantDigitalAccess(userId, productId)
  return { ok: true }
}
