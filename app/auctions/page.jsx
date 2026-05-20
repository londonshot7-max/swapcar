'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { useRouter } from 'next/navigation'

export default function Auctions() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchAuctions()

    const channel = supabase
      .channel('auctions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'auctions'
      }, () => fetchAuctions())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'auction_bids'
      }, () => fetchAuctions())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const fetchAuctions = async () => {
    const { data } = await supabase
      .from('auctions')
      .select(`*, listing:listings(title, images), seller:profiles!seller_id(full_name)`)
      .eq('status', 'active')
      .order('end_time', { ascending: true })
    setAuctions(data || [])
    setLoading(false)
  }

  const getTimeLeft = (endTime) => {
    const diff = new Date(endTime) - new Date()
    if (diff <= 0) return 'Skončená'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    if (h > 24) return `${Math.floor(h/24)}d ${h%24}h`
    return `${h}h ${m}m ${s}s`
  }

  const [times, setTimes] = useState({})
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes = {}
      auctions.forEach(a => { newTimes[a.id] = getTimeLeft(a.end_time) })
      setTimes(newTimes)
    }, 1000)
    return () => clearInterval(interval)
  }, [auctions])

  return (
    <>
      <style>{`
        .auctions-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .auctions-content { padding: 60px 48px; }
        .auctions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        @media (max-width: 768px) {
          .auctions-nav { padding: 0 16px; }
          .auctions-content { padding: 24px 16px; }
          .auctions-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="auctions-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            {user && <Link href="/dashboard"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>Dashboard</button></Link>}
            {user && <Link href="/auctions/create"><button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ff5500', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>+ Vytvoriť dražbu</button></Link>}
          </div>
        </nav>

        <div className="auctions-content">
          <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>ŽIVÉ<span style={{ color: '#ff5500' }}> DRAŽBY</span></div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>{auctions.length} aktívnych dražieb</div>

          {loading && <div style={{ color: '#7878a0' }}>Načítavam...</div>}

          <div className="auctions-grid">
            {auctions.map(auction => (
              <Link href={`/auctions/${auction.id}`} key={auction.id}>
                <div style={{ background: '#12121e', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid rgba(255,85,0,0.2)', cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ height: '180px', background: '#181827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', overflow: 'hidden', position: 'relative' }}>
                    {auction.listing?.images?.[0]
                      ? <img src={auction.listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🚗'}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,85,0,0.9)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>
                      🔴 LIVE
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{auction.listing?.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Aktuálna cena</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff5500' }}>{auction.current_price?.toLocaleString()} €</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zostatok</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: times[auction.id] === 'Skončená' ? '#7878a0' : '#eeeaf4' }}>
                          {times[auction.id] || getTimeLeft(auction.end_time)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#7878a0' }}>Predajca: {auction.seller?.full_name || 'Neznámy'}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!loading && auctions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#7878a0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔨</div>
              <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Žiadne aktívne dražby</div>
              <div style={{ marginBottom: '24px' }}>Buď prvý kto vytvorí dražbu!</div>
              {user && <Link href="/auctions/create"><button style={{ padding: '12px 32px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>Vytvoriť dražbu</button></Link>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}