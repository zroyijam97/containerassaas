"use client"
import { useEffect, useState } from 'react'
import styles from '../dashboard.module.css'

type Item = { product_id: number; title: string; file_url?: string; instructions?: string }

export default function DigitalProductsPage() {
  const [items, setItems] = useState<Item[]>([])
  useEffect(()=>{
    fetch('/api/digital/my').then(r=>r.json()).then(d=>setItems(d.rows||[]))
  },[])
  return (
    <div>
      <h1>Digital Products</h1>
      {items.length===0 ? (
        <p style={{ color: '#7a8599' }}>No purchased products yet.</p>
      ) : (
        <div style={{display:'grid', gap:12}}>
          {items.map(x=> (
            <div key={x.product_id} style={{background:'#101218', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:14}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center'}}>
                <div style={{fontWeight:700}}>{x.title}</div>
                <a href={x.file_url||'#'} target="_blank" rel="noreferrer" style={{background:'#6c47ff', color:'#fff', borderRadius:999, padding:'8px 12px', fontWeight:700}}>Download</a>
              </div>
              {x.instructions && <div style={{marginTop:8, color:'#9aa3b2'}}>{x.instructions}</div>}
              <div style={{marginTop:8, color:'#9aa3b2'}}>Affiliate link: {`${window.location.origin}/dp?ref=${encodeURIComponent('user')}`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
