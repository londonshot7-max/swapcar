'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { useParams, useRouter } from 'next/navigation'

export default function AuctionDetail() {
  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState('')
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchAuction()
    fetchBids()

    const channel = supabase
      .channel(`auction:${params.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'auction_bids',
        filter: `auction_id=eq.${params.id}`
      }, () => { fetchAuction(); fetchBids() })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [params.id])

  useEffect(() => {
    if (!auction) return
    const interval = setInterval(() => {
      const diff = new Date(auction.end_time) - new Date()
      if (diff <= 0) { setTimeLeft('Dražba skončila'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [auction])

  const fetchAuction = async () => {
    const { data } = await supabase
      .from('auctions')
      .select(`*, listing:listings(title, images, description), seller:profiles!seller_id(full_name)`)
      .eq('id', params.id)
      .single()
    setAuction(data)
    if (data) setBidAmount(data.current_price + data.min_increment)
    setLoading(false)
  }

  const fetchBids = async () => {
    const { data } = await supabase
      .from('auction_bids')
      .select(`*, bidder:profiles!bidder_id(full_name)`)
      .eq('auction_id', params.id)
      .order('created_at', { ascending: false })
    setBids(data || [])
  }

  const placeBid = async () => {
    if (!user) { router.push('/login'); return }
    if (user.id === auction.seller_id) { setError('Nemôžeš prihodiť na vlastnú dražbu'); return }
    if (bidAmount < auction.current_price + auction.min_increment) {
      setError(`Minimálny príhoz je ${auction.current_price + auction.min_increment} €`)
      return
    }

    setPlacing(true)
    setError('')

    const { error: bidError } = await supabase.from('auction_bids').insert({
      auction_id: auction.id,
      bidder_id: user.id,
      amount: Number(bidAmount)
    })

    if (!bidError) {
      await supabase.from('auctions').update({
        current_price: Number(bidAmount)
      }).eq('id', auction.id)
      fetchAuction()
      fetchBids()
    }
    setPlacing(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Načítavam...</div>
  if (!auction) return <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Dražba nenájdená.</div>

  return (
    <>
      <style>{`
        .auction-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        @media (max-width: 768px) {
          .auction-grid { grid-template-columns: 1fr; gap: 24px; }
          .auction-nav { padding: 0 16px !important; }
          .auction-content { padding: 24px 16px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="auction-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '68px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/auctions"><div style={{ fontSize: '14px', color: '#7878a0' }}>← Späť na dražby</div></Link>
        </nav>

        <div className="auction-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' }}>
          <div className="auction-grid">
            {/* FOTO + INFO */}
            <div>
              <div style={{ height: '360px', background: '#12121e', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {auction.listing?.images?.[0]
                  ? <img src={auction.listing.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ fontSize: '80px' }}>🚗</div>}
              </div>
              {auction.listing?.description && (
                <div style={{ marginTop: '24px', background: '#12121e', borderRadius: '16px', padding: '24px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Popis</div>
                  <div style={{ fontSize: '14px', color: '#7878a0', lineHeight: '1.7' }}>{auction.listing.description}</div>
                </div>
              )}
            </div>

            {/* BID PANEL */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.3)', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: '#ff5500', marginBottom: '16px' }}>
                🔴 LIVE DRAŽBA
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>{auction.listing?.title}</div>

              <div style={{ background: '#12121e', borderRadius: '16px', padding: '24px', border: '0.5px solid rgba(255,85,0,0.2)', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Aktuálna cena</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#ff5500' }}>{auction.current_price?.toLocaleString()} €</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Zostatok</div>
                    <div style={{ fontSize: '20px', fontWeight: 700 }}>{timeLeft}</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#7878a0', marginBottom: '4px' }}>Minimálny príhoz: <span style={{ color: '#eeeaf4' }}>{auction.min_increment} €</span></div>
                <div style={{ fontSize: '13px', color: '#7878a0' }}>Predajca: <span style={{ color: '#eeeaf4' }}>{auction.seller?.full_name}</span></div>
              </div>

              {error && <div style={{ background: 'rgba(255,50,50,0.1)', padding: '12px', borderRadius: '8px', color: '#ff6666', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

              {auction.status === 'active' && user?.id !== auction.seller_id && (
                <div style={{ background: '#12121e', borderRadius: '16px', padding: '24px', border: '0.5px solid rgba(255,255,255,0.07)', marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Moja ponuka</div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      style={{ flex: 1, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '12px 16px', fontSize: '16px', outline: 'none' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 700 }}>€</span>
                  </div>
                  <button
                    onClick={placeBid}
                    disabled={placing}
                    style={{ width: '100%', padding: '14px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '12px', opacity: placing ? 0.7 : 1 }}>
                    {placing ? 'Pridávam príhoz...' : '🔨 Prihodiť'}
                  </button>
                </div>
              )}

              {/* BIDS HISTORY */}
              <div style={{ background: '#12121e', borderRadius: '16px', padding: '24px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>História príhozov ({bids.length})</div>
                {bids.length === 0 ? (
                  <div style={{ color: '#7878a0', textAlign: 'center', padding: '20px 0' }}>Zatiaľ žiadne príhozy</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bids.map((bid, i) => (
                      <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: i === 0 ? 'rgba(255,85,0,0.08)' : '#0a0a12', borderRadius: '8px', border: `0.5px solid ${i === 0 ? 'rgba(255,85,0,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                        <div style={{ fontSize: '14px' }}>{i === 0 ? '👑 ' : ''}{bid.bidder?.full_name || 'Anonymný'}</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: i === 0 ? '#ff5500' : '#eeeaf4' }}>{bid.amount?.toLocaleString()} €</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}