import { auth } from '@clerk/nextjs/server'
import { getDigitalGoodBySlug } from '@/lib/db'

export default async function DigitalLanding({ params }: { params: { slug: string } }) {
  const { userId } = await auth()
  const data = await getDigitalGoodBySlug(params.slug)
  if (!data) return <div style={{padding:16}}>Not found</div>
  return (
    <div style={{padding:16}}>
      <div dangerouslySetInnerHTML={{ __html: data.html }} />
      <div style={{marginTop:24, background:'#101218', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:16}}>
        <div style={{fontWeight:700, marginBottom:8}}>{data.title}</div>
        <div style={{marginBottom:8}}>Price: RM {Number(data.price)}</div>
        {!userId ? (
          <a href="/sign-in" style={{display:'inline-block', background:'#6c47ff', color:'#fff', borderRadius:999, padding:'10px 14px', fontWeight:700}}>Sign in to buy</a>
        ) : (
          <form action={`/api/digital/buy`} method="POST">
            <input type="hidden" name="slug" value={params.slug} />
            <button type="submit" style={{display:'inline-block', background:'#6c47ff', color:'#fff', borderRadius:999, padding:'10px 14px', fontWeight:700}}>Buy with Wallet</button>
          </form>
        )}
      </div>
    </div>
  )
}
