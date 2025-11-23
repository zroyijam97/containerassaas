"use client"
import { useEffect, useState } from 'react'
import styles from '../admin.module.css'

type Tx = { id: number; user_id: string; type: string; amount: number; status: string; created_at: string }
type Pay = { id: number; user_id: string; amount: number; status: string; provider_id?: string; created_at: string }

export default function AdminEarningPage() {
  const [txs, setTxs] = useState<Tx[]>([])
  const [pays, setPays] = useState<Pay[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7'|'30'|'90'>('30')
  const [filter, setFilter] = useState<'completed'|'pending'|'both'>('both')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [t, p] = await Promise.all([
        fetch('/api/admin/transactions').then(r=>r.json()).catch(()=>({rows:[]})),
        fetch('/api/admin/payments').then(r=>r.json()).catch(()=>({rows:[]})),
      ])
      setTxs(t.rows || [])
      setPays(p.rows || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Earning</h1>
        <div className={styles.actions}>
          <select value={period} onChange={e=>setPeriod(e.target.value as '7'|'30'|'90')} className={styles.btn} style={{height:36}}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select value={filter} onChange={e=>setFilter(e.target.value as 'completed'|'pending'|'both')} className={styles.btn} style={{height:36}}>
            <option value="both">Both</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      {/* Chart */}
      <div className={styles.card}>
        <EarningChart txs={txs} pays={pays} period={parseInt(period,10)} filter={filter} />
      </div>

      <div className={styles.card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontWeight:700}}>Transactions (completed)</div>
          {loading && <div style={{color:'#9aa3b2'}}>Loading…</div>}
        </div>
        <div style={{marginTop:10, display:'grid', gap:8}}>
          {txs.length===0 && <div style={{color:'#9aa3b2'}}>No transactions</div>}
          {txs.map(x => (
            <div key={`t-${x.id}`} style={{display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:8, alignItems:'center', background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'8px 10px'}}>
              <div>{x.user_id}</div>
              <div>{x.type}</div>
              <div>RM {x.amount}</div>
              <div>{new Date(x.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card} style={{marginTop:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontWeight:700}}>Payments (pending & completed)</div>
          {loading && <div style={{color:'#9aa3b2'}}>Loading…</div>}
        </div>
        <div style={{marginTop:10, display:'grid', gap:8}}>
          {pays.length===0 && <div style={{color:'#9aa3b2'}}>No payments</div>}
          {pays.map(x => (
            <div key={`p-${x.id}`} style={{display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:8, alignItems:'center', background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'8px 10px'}}>
              <div>{x.user_id}</div>
              <div style={{color: x.status==='completed' ? '#9dffa8' : '#f4c2c2'}}>{x.status}</div>
              <div>RM {x.amount}</div>
              <div>{new Date(x.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EarningChart({ txs, pays, period, filter }: { txs: Tx[]; pays: Pay[]; period: number; filter: 'completed'|'pending'|'both' }) {
  const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const end = new Date()
  const start = new Date(end.getTime() - period*24*60*60*1000)
  start.setHours(0,0,0,0)
  const days: string[] = []
  for (let i=0;i<period;i++) {
    const d = new Date(start.getTime() + i*24*60*60*1000)
    days.push(dateKey(d))
  }
  const bucketCompleted: Record<string, number> = {}
  const bucketPending: Record<string, number> = {}
  for (const k of days) { bucketCompleted[k]=0; bucketPending[k]=0 }
  txs.forEach(t => {
    const d = new Date(t.created_at)
    const k = dateKey(d)
    if (k>=days[0] && k<=days[days.length-1]) bucketCompleted[k] = (bucketCompleted[k]||0) + Number(t.amount||0)
  })
  pays.forEach(p => {
    const d = new Date(p.created_at)
    const k = dateKey(d)
    if (k>=days[0] && k<=days[days.length-1] && (p.status==='pending' || p.status==='completed')) bucketPending[k] = (bucketPending[k]||0) + Number(p.amount||0)
  })
  const completed = days.map(k=>({x:k,y:bucketCompleted[k]||0}))
  const pending = days.map(k=>({x:k,y:bucketPending[k]||0}))
  const totalCompleted = completed.reduce((s,d)=>s+d.y,0)
  const totalPending = pending.reduce((s,d)=>s+d.y,0)
  const width = 820
  const height = 220
  const pad = 28
  const series: {name:string;color:string;data:{x:string;y:number}[]}[] = []
  if (filter==='completed' || filter==='both') series.push({name:'Completed', color:'#6c47ff', data:completed})
  if (filter==='pending' || filter==='both') series.push({name:'Pending', color:'#ff8a8a', data:pending})
  const maxY = Math.max(1, ...series.flatMap(s=>s.data.map(d=>d.y)))
  const makePath = (data:{x:string;y:number}[]) => {
    return data.map((d,i)=>{
      const x = pad + (i/(data.length-1))*(width-pad*2)
      const y = height - pad - (d.y/maxY)*(height-pad*2)
      return `${i===0?'M':'L'} ${x} ${y}`
    }).join(' ')
  }
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontWeight:700}}>Earnings Over Time</div>
        <div style={{display:'flex', gap:12}}>
          {series.map(s=> (
            <div key={s.name} style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{display:'inline-block', width:12, height:12, borderRadius:3, background:s.color}} />
              <span style={{color:'#9aa3b2'}}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:8, display:'flex', gap:12}}>
        <div style={{background:'#0f1117', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'8px 12px'}}>
          <div style={{color:'#9aa3b2', fontSize:12}}>Total Completed</div>
          <div style={{fontWeight:700}}>RM {totalCompleted}</div>
        </div>
        <div style={{background:'#0f1117', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'8px 12px'}}>
          <div style={{color:'#9aa3b2', fontSize:12}}>Total Pending</div>
          <div style={{fontWeight:700}}>RM {totalPending}</div>
        </div>
      </div>
      <svg width={width} height={height} style={{width:'100%', maxWidth:width, background:'#0f1117', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, marginTop:10, padding:6}}>
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        {[0.25,0.5,0.75].map((g,i)=> (
          <line key={i} x1={pad} x2={width-pad} y1={height-pad-(g*(height-pad*2))} y2={height-pad-(g*(height-pad*2))} stroke="rgba(255,255,255,0.08)" />
        ))}
        {series.map(s=> (
          <path key={s.name} d={makePath(s.data)} fill="none" stroke={s.color} strokeWidth={2} />
        ))}
        {days.map((k,i)=>{
          const x = pad + (i/(days.length-1))*(width-pad*2)
          return <line key={k} x1={x} x2={x} y1={height-pad} y2={height-pad+4} stroke="rgba(255,255,255,0.12)" />
        })}
      </svg>
    </div>
  )
}
