"use client"
import { useEffect, useState } from 'react'
import styles from '../admin.module.css'

export default function AdminLandingPage() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [html, setHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'create'|'edit'>('create')
  const [currentId, setCurrentId] = useState<number|undefined>(undefined)
  const [lps, setLps] = useState<{id:number; title:string; slug:string; html:string; created_at:string}[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function refresh() {
    setLoading(true)
    const d = await fetch('/api/admin/digital/landing').then(r=>r.json()).catch(()=>({rows:[]}))
    setLps(d.rows || [])
    setLoading(false)
  }

  useEffect(()=>{
    const t = setTimeout(()=>{ refresh() }, 0)
    return ()=>clearTimeout(t)
  },[])

  async function save() {
    if (!title || !slug || !html) { setMessage('Isi semua medan'); return }
    setSaving(true)
    let r: Response
    if (mode==='edit' && currentId) {
      r = await fetch('/api/admin/digital/landing',{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: currentId, title, slug, html }) })
    } else {
      r = await fetch('/api/admin/digital/landing',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, slug, html }) })
    }
    setSaving(false)
    if (!r.ok) { setMessage('Gagal simpan'); return }
    setMessage(mode==='edit' ? 'Berjaya dikemaskini' : 'Berjaya disimpan')
    if (mode==='create') { setTitle(''); setSlug(''); setHtml('') }
    setMode('create'); setCurrentId(undefined)
    setShowForm(false)
    refresh()
  }

  async function editLanding(id: number) {
    setLoading(true)
    const d = await fetch(`/api/admin/digital/landing?id=${id}`).then(r=>r.json()).catch(()=>({row:null}))
    setLoading(false)
    const row = d.row
    if (!row) return
    setTitle(row.title||'')
    setSlug(row.slug||'')
    setHtml(row.html||'')
    setCurrentId(row.id)
    setMode('edit')
    setMessage('Edit mode')
  }

  function resetForm() {
    setTitle('')
    setSlug('')
    setHtml('')
    setMode('create')
    setCurrentId(undefined)
    setMessage('')
    setShowForm(true)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Landing Page</h1>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={resetForm}>Create Landing Page</button>
        </div>
      </div>
      {(showForm || mode==='edit') && (
        <>
          <div className={styles.card}>
            <div style={{display:'grid', gap:8}}>
              <input className={styles.btn} style={{height:36}} placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
              <input className={styles.btn} style={{height:36}} placeholder="Slug" value={slug} onChange={e=>setSlug(e.target.value)} />
              <textarea style={{minHeight:220, border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, background:'#0f1117', color:'#eef0f6', padding:10}} placeholder="Paste HTML" value={html} onChange={e=>setHtml(e.target.value)} />
              <div>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={save} disabled={saving}>{saving? 'Saving…' : (mode==='edit' ? 'Update Landing Page' : 'Save Landing Page')}</button>
                <button className={styles.btn} style={{marginLeft:8}} onClick={()=>{ setShowForm(false); setMode('create'); setMessage(''); }}>Cancel</button>
              </div>
              {message && <div style={{color:'#9aa3b2'}}>{message}</div>}
            </div>
          </div>
          <div className={styles.card} style={{marginTop:16}}>
            <div style={{fontWeight:700, marginBottom:8}}>Preview</div>
            <div style={{background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:12}} dangerouslySetInnerHTML={{__html: html||'<div style="color:#9aa3b2">Paste HTML untuk preview</div>'}} />
          </div>
        </>
      )}
      <div className={styles.card} style={{marginTop:16}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontWeight:700}}>Semua Landing Page</div>
          {loading && <div style={{color:'#9aa3b2'}}>Loading…</div>}
        </div>
        <div style={{marginTop:8, display:'grid', gap:12, gridTemplateColumns:'repeat(2, minmax(0, 1fr))'}}>
          {lps.length===0 && <div style={{color:'#9aa3b2'}}>Belum ada landing page</div>}
          {lps.map(lp => (
            <div key={lp.id} style={{border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px'}}>
                <div>
                  <div style={{fontWeight:600}}>{lp.title}</div>
                  <div style={{color:'#9aa3b2'}}>/{lp.slug}</div>
                </div>
                <div>
                  <button className={styles.btn} onClick={()=>editLanding(lp.id)}>Edit</button>
                </div>
              </div>
              <div style={{background:'#0f1117', borderTop:'1px solid rgba(255,255,255,0.06)', maxHeight:260, overflow:'auto', padding:12}} dangerouslySetInnerHTML={{__html: lp.html || '<div style="color:#9aa3b2">No HTML</div>'}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
