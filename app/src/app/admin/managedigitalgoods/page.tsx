"use client"
import { useEffect, useState } from 'react'
import styles from '../admin.module.css'

type LP = { id:number; title:string; slug:string }
type Prod = { id:number; title:string; price:number; stock:number; affiliate_percent:number; file_url?:string }

export default function ManageDigitalProductsPage() {
  const [tab, setTab] = useState<'landing'|'product'|'goods'>('landing')
  const [lps, setLps] = useState<LP[]>([])
  const [prods, setProds] = useState<Prod[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [html, setHtml] = useState('')
  const [pTitle, setPTitle] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [aff, setAff] = useState('0')
  const [fileUrl, setFileUrl] = useState('')
  const [instr, setInstr] = useState('')
  const [lpId, setLpId] = useState('')
  const [prodId, setProdId] = useState('')
  const [dgSlug, setDgSlug] = useState('')

  function refresh() {
    fetch('/api/admin/digital/landing').then(r=>r.json()).then(d=>setLps(d.rows||[]))
    fetch('/api/admin/digital/product').then(r=>r.json()).then(d=>setProds(d.rows||[]))
  }
  useEffect(()=>{ refresh() },[])

  async function addLanding() {
    if (!title || !slug || !html) return
    await fetch('/api/admin/digital/landing',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, slug, html })})
    setTitle(''); setSlug(''); setHtml('')
    refresh()
  }
  async function addProduct() {
    const payload = { title: pTitle, price: Number(price||0), stock: Number(stock||0), affiliate_percent: Number(aff||0), file_url: fileUrl, instructions: instr }
    await fetch('/api/admin/digital/product',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    setPTitle(''); setPrice(''); setStock('0'); setAff('0'); setFileUrl(''); setInstr('')
    refresh()
  }
  async function addGood() {
    const payload = { landing_page_id: Number(lpId), product_id: Number(prodId), slug: dgSlug }
    await fetch('/api/admin/digital/good',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    setLpId(''); setProdId(''); setDgSlug('')
    refresh()
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Manage Digital Products</h1>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={()=>setTab('landing')}>Landing Page</button>
          <button className={styles.btn} onClick={()=>setTab('product')}>Product</button>
          <button className={styles.btn} onClick={()=>setTab('goods')}>Digital Goods</button>
        </div>
      </div>

      {tab==='landing' && (
        <div className={styles.card}>
          <div style={{display:'grid', gap:8}}>
            <input className={styles.btn} style={{height:36}} placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <input className={styles.btn} style={{height:36}} placeholder="Slug" value={slug} onChange={e=>setSlug(e.target.value)} />
            <textarea style={{minHeight:160, border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, background:'#0f1117', color:'#eef0f6', padding:10}} placeholder="Paste HTML" value={html} onChange={e=>setHtml(e.target.value)} />
            <div>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={addLanding}>Save Landing Page</button>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <div style={{fontWeight:700, marginBottom:6}}>Existing</div>
            <div style={{display:'grid', gap:8}}>
              {lps.map(lp => (
                <div key={lp.id} className={styles.card} style={{padding:10}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center'}}>
                    <div>{lp.title}</div>
                    <div style={{color:'#9aa3b2'}}>{lp.slug}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='product' && (
        <div className={styles.card}>
          <div style={{display:'grid', gap:8}}>
            <input className={styles.btn} style={{height:36}} placeholder="Product Title" value={pTitle} onChange={e=>setPTitle(e.target.value)} />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
              <input className={styles.btn} style={{height:36}} placeholder="Price (RM)" value={price} onChange={e=>setPrice(e.target.value)} />
              <input className={styles.btn} style={{height:36}} placeholder="Stock" value={stock} onChange={e=>setStock(e.target.value)} />
              <input className={styles.btn} style={{height:36}} placeholder="Affiliate %" value={aff} onChange={e=>setAff(e.target.value)} />
            </div>
            <input className={styles.btn} style={{height:36}} placeholder="File URL" value={fileUrl} onChange={e=>setFileUrl(e.target.value)} />
            <textarea style={{minHeight:120, border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, background:'#0f1117', color:'#eef0f6', padding:10}} placeholder="Instructions" value={instr} onChange={e=>setInstr(e.target.value)} />
            <div>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={addProduct}>Save Product</button>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <div style={{fontWeight:700, marginBottom:6}}>Existing</div>
            <div style={{display:'grid', gap:8}}>
              {prods.map(p => (
                <div key={p.id} className={styles.card} style={{padding:10}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:8, alignItems:'center'}}>
                    <div>{p.title}</div>
                    <div>RM {p.price}</div>
                    <div>{p.stock} in stock</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='goods' && (
        <div className={styles.card}>
          <div style={{display:'grid', gap:8}}>
            <select className={styles.btn} style={{height:36}} value={lpId} onChange={e=>setLpId(e.target.value)}>
              <option value="">Select Landing</option>
              {lps.map(lp=> <option key={lp.id} value={lp.id}>{lp.title}</option>)}
            </select>
            <select className={styles.btn} style={{height:36}} value={prodId} onChange={e=>setProdId(e.target.value)}>
              <option value="">Select Product</option>
              {prods.map(p=> <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input className={styles.btn} style={{height:36}} placeholder="Slug (public)" value={dgSlug} onChange={e=>setDgSlug(e.target.value)} />
            <div>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={addGood}>Create Digital Good</button>
            </div>
          </div>
          <div style={{marginTop:8, color:'#9aa3b2'}}>Public URL: /dp/[slug]</div>
        </div>
      )}
    </div>
  )
}
