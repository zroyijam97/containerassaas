"use client"
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import styles from './billing.module.css'

type Tx = { id: number; type: string; amount: number; status: string; created_at: string }
type Pay = { id: number; amount: number; status: string; created_at: string }

export default function BillingPage() {
  const { isSignedIn } = useAuth()
  const [balance, setBalance] = useState(0)
  const [tab, setTab] = useState<'transactions'|'payments'>('transactions')
  const [txs, setTxs] = useState<Tx[]>([])
  const [pays, setPays] = useState<Pay[]>([])
  const [amount, setAmount] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  function refresh() {
    fetch('/api/wallet/balance').then(r=>r.json()).then(d=>setBalance(Number(d.balance||0)))
    fetch('/api/wallet/transactions').then(r=>r.json()).then(d=>setTxs(d.rows||[]))
    fetch('/api/wallet/payments').then(r=>r.json()).then(d=>setPays(d.rows||[]))
  }
  useEffect(()=>{ refresh() },[])
  useEffect(()=>{
    const last = typeof window !== 'undefined' ? localStorage.getItem('chipLastPurchase') : null
    if (last) {
      fetch(`/api/wallet/chip/verify?id=${last}`).then(r=>r.json()).then(d=>{
        if (d.status === 'paid') {
          localStorage.removeItem('chipLastPurchase')
          refresh()
          setTab('transactions')
        }
      })
    }
  },[])

  async function addCredit() {
    const amt = Number(amount)
    if (!(amt>0)) return
    setLoading(true)
    const r = await fetch('/api/wallet/add-credit',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({amount:amt})})
    setLoading(false)
    if (!r.ok) { setError('Failed to add credit'); return }
    setAmount('')
    refresh()
  }
  async function topup() {
    const amt = Number(amount)
    if (!(amt>0)) { setError('Masukkan jumlah kredit'); amountRef.current?.focus(); amountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    if (!isSignedIn) { setError('Please sign in first'); return }
    setLoading(true)
    const r = await fetch('/api/wallet/chip/create',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({amount:amt})})
    const d = await r.json()
    setLoading(false)
    if (!r.ok) { setError(d?.details || 'Failed to create purchase'); return }
    if (d.checkoutUrl) {
      if (d.providerId) {
        try { localStorage.setItem('chipLastPurchase', String(d.providerId)) } catch {}
      }
      window.location.href = d.checkoutUrl
      return
    }
    setAmount('')
    setTab('payments')
    refresh()
  }
  async function redeem() {
    if (!code) return
    await fetch('/api/wallet/redeem',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({code})})
    setCode('')
    refresh()
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>Billing</div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={redeem}>Redeem</button>
          <button className={styles.btn} onClick={topup}>Add Credit</button>
        </div>
      </div>
      <div className={styles.card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>Current Credits</div>
          <div style={{fontWeight:700}}>RM {balance}</div>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.redeemRow}>
          <input className={styles.input} placeholder="Voucher code" value={code} onChange={e=>setCode(e.target.value)} />
          <input ref={amountRef} className={styles.input} placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <button className={styles.btn} onClick={topup} disabled={loading}>{loading ? 'Processing…' : 'Add Direct'}</button>
        </div>
        {error && <div style={{marginTop:8,color:'#ff8a8a'}}>{error}</div>}
      </div>
      <div className={styles.card}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab==='transactions'?styles.tabActive:''}`} onClick={()=>setTab('transactions')}>Transactions</button>
          <button className={`${styles.tab} ${tab==='payments'?styles.tabActive:''}`} onClick={()=>setTab('payments')}>Payments</button>
        </div>
        {tab==='transactions' ? (
          <div className={styles.list}>
            {txs.length===0 && <div>No transactions found</div>}
            {txs.map(x=> (
              <div key={x.id} className={styles.item}>
                <div>{x.type}</div>
                <div>RM {x.amount}</div>
                <div>{new Date(x.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {pays.length===0 && <div>No payments found</div>}
            {pays.map(x=> (
              <div key={x.id} className={styles.item}>
                <div>{x.status}</div>
                <div>RM {x.amount}</div>
                <div>{new Date(x.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
