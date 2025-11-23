"use client"
import { useEffect, useState } from 'react'
import styles from '../admin.module.css'

type Prod = { id:number; title:string; price:number|string; stock:number|string; affiliate_percent:number; file_url?:string; description?:string; instructions?:string; created_at:string }
type Variation = { name: string; price: string; stock: string }
type FileItem = { file_url: string }

export default function AdminProductsPage() {
  const [prods, setProds] = useState<Prod[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<'create'|'edit'>('create')
  const [currentId, setCurrentId] = useState<number|undefined>(undefined)

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [aff, setAff] = useState('0')
  const [fileUrl, setFileUrl] = useState('')
  const [instr, setInstr] = useState('')
  const [desc, setDesc] = useState('')
  const [vars, setVars] = useState<Variation[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function refresh() {
    setLoading(true)
    const d = await fetch('/api/admin/digital/product').then(r=>r.json()).catch(()=>({rows:[]}))
    setProds(d.rows || [])
    setLoading(false)
  }

  useEffect(()=>{
    const t = setTimeout(()=>{ refresh() }, 0)
    return ()=>clearTimeout(t)
  },[])

  function openCreate() {
    setTitle(''); setPrice(''); setStock('0'); setAff('0'); setFileUrl(''); setInstr(''); setDesc(''); setVars([]); setFiles([])
    setMode('create'); setCurrentId(undefined); setMessage('')
    setShowForm(true)
  }

  async function editProduct(id: number) {
    setLoading(true)
    const d = await fetch(`/api/admin/digital/product?id=${id}`).then(r=>r.json()).catch(()=>({row:null}))
    setLoading(false)
    const row = d.row as Prod | null
    if (!row) return
    setTitle(row.title||'')
    setPrice(String(row.price||''))
    setStock(String(row.stock||0))
    setAff(String(row.affiliate_percent||0))
    setFileUrl(String(row.file_url||''))
    setInstr(String(row.instructions||''))
    setDesc(String(row.description||''))
    const v = (d.variations||[]) as { name:string; price:number; stock:number }[]
    setVars(v.map(x=>({ name:x.name, price:String(x.price), stock:String(x.stock) })))
    const f = (d.files||[]) as { file_url:string }[]
    setFiles(f)
    setCurrentId(row.id)
    setMode('edit')
    setShowForm(true)
    setMessage('Edit mode')
  }

  async function save() {
    if (!title || !price) { setMessage('Isi semua medan'); return }
    const payload = {
      title,
      price: Number(price||0),
      stock: Number(stock||0),
      affiliate_percent: Number(aff||0),
      file_url: fileUrl || undefined,
      description: desc || undefined,
      instructions: instr || undefined,
      variations: vars.map(v=>({ name: v.name, price: Number(v.price||0), stock: Number(v.stock||0) })),
      files: files.map(f=>({ file_url: f.file_url }))
    }
    setSaving(true)
    let r: Response
    if (mode==='edit' && currentId) {
      r = await fetch('/api/admin/digital/product',{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: currentId, ...payload }) })
    } else {
      r = await fetch('/api/admin/digital/product',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    }
    setSaving(false)
    if (!r.ok) { setMessage('Gagal simpan'); return }
    setMessage(mode==='edit' ? 'Berjaya dikemaskini' : 'Berjaya disimpan')
    setShowForm(false)
    setMode('create'); setCurrentId(undefined)
    refresh()
  }

  function addVariation() {
    setVars([...vars, { name:'', price:'', stock:'' }])
  }

  function updateVariation(i: number, key: keyof Variation, val: string) {
    const copy = [...vars];
    copy[i] = { ...copy[i], [key]: val } as Variation
    setVars(copy)
  }

  function removeVariation(i: number) {
    const copy = [...vars];
    copy.splice(i,1);
    setVars(copy)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const filesSelected = e.target.files
    if (!filesSelected || !filesSelected.length) return
    const base = 'products/'
    for (const file of Array.from(filesSelected)) {
      const key = base + Date.now() + '-' + (file.name||'file')
      const ps = await fetch('/api/storage/presign',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ key, contentType: file.type||'application/octet-stream' }) }).then(r=>r.json()).catch(()=>null)
      if (!ps || !ps.uploadUrl) continue
      await fetch(ps.uploadUrl, { method:'PUT', body: file, headers: { 'Content-Type': file.type||'application/octet-stream' } })
      setFiles(prev => [...prev, { file_url: ps.downloadUrl }])
    }
    e.currentTarget.value = ''
  }

  function removeFile(idx: number) {
    const arr = [...files]
    arr.splice(idx,1)
    setFiles(arr)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Products</h1>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>Create Product</button>
        </div>
      </div>

      {showForm && (
        <div className={styles.card}>
          <div style={{display:'grid', gap:8}}>
            <input className={styles.btn} style={{height:36}} placeholder="Product Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
              <input className={styles.btn} style={{height:36}} placeholder="Price (RM)" value={price} onChange={e=>setPrice(e.target.value)} />
              <input className={styles.btn} style={{height:36}} placeholder="Stock" value={stock} onChange={e=>setStock(e.target.value)} />
              <input className={styles.btn} style={{height:36}} placeholder="Affiliate %" value={aff} onChange={e=>setAff(e.target.value)} />
            </div>
            <input className={styles.btn} style={{height:36}} placeholder="File URL" value={fileUrl} onChange={e=>setFileUrl(e.target.value)} />
            <div style={{display:'grid', gap:8}}>
              <div style={{fontWeight:700}}>Variations</div>
              <div style={{display:'grid', gap:8}}>
                {vars.map((v,i)=> (
                  <div key={i} style={{display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr auto', gap:8, alignItems:'center'}}>
                    <input className={styles.btn} style={{height:36}} placeholder="Nama Variasi" value={v.name} onChange={e=>updateVariation(i,'name',e.target.value)} />
                    <input className={styles.btn} style={{height:36}} placeholder="Harga" value={v.price} onChange={e=>updateVariation(i,'price',e.target.value)} />
                    <input className={styles.btn} style={{height:36}} placeholder="Stok" value={v.stock} onChange={e=>updateVariation(i,'stock',e.target.value)} />
                    <button className={styles.btn} onClick={()=>removeVariation(i)}>Remove</button>
                  </div>
                ))}
              </div>
              <div>
                <button className={styles.btn} onClick={addVariation}>Add Variation</button>
              </div>
            </div>
            <div style={{display:'grid', gap:8}}>
              <div style={{fontWeight:700}}>Files</div>
              <input type="file" multiple onChange={handleFileSelect} />
              <div style={{display:'grid', gap:6}}>
                {files.map((f,i)=> (
                  <div key={i} style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'6px 8px'}}>
                    <a href={f.file_url} target="_blank" rel="noreferrer" style={{color:'#9aa3b2'}}>{f.file_url}</a>
                    <button className={styles.btn} onClick={()=>removeFile(i)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
            <textarea style={{minHeight:100, border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, background:'#0f1117', color:'#eef0f6', padding:10}} placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
            <textarea style={{minHeight:140, border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, background:'#0f1117', color:'#eef0f6', padding:10}} placeholder="Instructions" value={instr} onChange={e=>setInstr(e.target.value)} />
            <div>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={save} disabled={saving}>{saving? 'Saving…' : (mode==='edit' ? 'Update Product' : 'Save Product')}</button>
              <button className={styles.btn} style={{marginLeft:8}} onClick={()=>{ setShowForm(false); setMode('create'); setMessage(''); }}>Cancel</button>
            </div>
            {message && <div style={{color:'#9aa3b2'}}>{message}</div>}
          </div>
        </div>
      )}

      <div className={styles.card} style={{marginTop:16}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontWeight:700}}>Semua Products</div>
          {loading && <div style={{color:'#9aa3b2'}}>Loading…</div>}
        </div>
        <div style={{marginTop:8, display:'grid', gap:12, gridTemplateColumns:'repeat(2, minmax(0, 1fr))'}}>
          {prods.length===0 && <div style={{color:'#9aa3b2'}}>Belum ada product</div>}
          {prods.map(p => (
            <div key={p.id} style={{border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8, alignItems:'center', padding:'10px 12px'}}>
                <div>
                  <div style={{fontWeight:600}}>{p.title}</div>
                  <div style={{color:'#9aa3b2'}}>RM {p.price} • Stock {p.stock} • Aff {p.affiliate_percent}%</div>
                  {p.description && <div style={{marginTop:4, color:'#d7dbea'}}>{p.description}</div>}
                  {p.file_url && <div style={{marginTop:4}}><a href={p.file_url} target="_blank" rel="noreferrer" style={{color:'#9aa3b2'}}>File</a></div>}
                </div>
                <div>
                  <button className={styles.btn} onClick={()=>editProduct(p.id)}>Edit</button>
                </div>
              </div>
              <div style={{background:'#0f1117', borderTop:'1px solid rgba(255,255,255,0.06)', maxHeight:220, overflow:'auto', padding:12}}>
                <div style={{fontWeight:700, marginBottom:6}}>Instructions</div>
                <div style={{color:'#d7dbea'}}>{p.instructions || 'No instructions'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
