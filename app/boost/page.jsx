'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { useRouter } from 'next/navigation'

const BOOST_PLANS = [
  { id: '7days', label: '7 dní', price: 2.99, days: 7, description: 'Základný boost' },
  { id: '14days', label: '14 dní', price: 4.99, days: 14, description: 'Populárna voľba', popular: true },
  { id: '30days', label: '30 dní', price: 8.99, days: 30, description: 'Maximálna viditeľnosť' },
]

export default function Boost() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [myListings, setMyListings] = useState([])
  const [selectedListing, setSelectedListing] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('14days')
  const [boosting, setBoosting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) fetchMyListings()
  }, [user])

  const fetchMyListings = async () => {
    const { data } = await supabase.from('listings').select('id, title, price, boosted, boosted_until').eq('user_id', user.id).eq('status', 'active')
    setMyListings(data || [])
  }

  const handleBoost = async () => {
    if (!selectedListing) return
    setBoosting(true)
    const plan = BOOST_PLANS.find(p => p.id === selectedPlan)
    const boostedUntil = new Date()
    boostedUntil.setDate(boostedUntil.getDate() + plan.days)

    await supabase.from('listings').update({
      boosted: true,
      boosted_until: boostedUntil.toISOString()
    }).eq('id', selectedListing)

    setSuccess(true)
    fetchMyListings()
    setBoosting(false)
  }

  const isBoosted = (listing) => {
    return listing.boosted && new Date(listing.boosted_until) > new Date()
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0' }}>Načítavam...</div>

  return (
    <>
      <style>{`
        .boost-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .boost-content { padding: 60px 48px; max-width: 700px; }
        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        @media (max-width: 768px) {
          .boost-nav { padding: 0 16px; }
          .boost-content { padding: 24px 16px; }
          .plans-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="boost-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/dashboard"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>Dashboard</button></Link>
        </nav>

        <div className="boost-content">
          <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>🚀 BOOST</div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>Daj svojmu inzerátu väčšiu viditeľnosť</div>

          {success ? (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Boost aktivovaný!</div>
              <div style={{ color: '#7878a0', marginBottom: '24px' }}>Tvoj inzerát je teraz zvýraznený v prehľade</div>
              <Link href="/browse"><button style={{ padding: '12px 32px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Zobraziť v prehľade</button></Link>
            </div>
          ) : (
            <>
              {/* MOJE INZERÁTY */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'block' }}>Vyber inzerát</label>
                <select
                  value={selectedListing}
                  onChange={e => setSelectedListing(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: '#12121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#eeeaf4', fontSize: '15px', outline: 'none', cursor: 'pointer' }}>
                  <option value="">-- Vyber inzerát --</option>
                  {myListings.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title} {isBoosted(l) ? '🚀 (boosted)' : ''}
                    </option>
                  ))}
                </select>
                {myListings.length === 0 && (
                  <div style={{ fontSize: '13px', color: '#7878a0', marginTop: '8px' }}>
                    Nemáš žiadne aktívne inzeráty. <Link href="/add-listing" style={{ color: '#ff5500' }}>Pridaj inzerát</Link>
                  </div>
                )}
              </div>

              {/* PLANS */}
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', display: 'block' }}>Vyber plán</label>
              </div>
              <div className="plans-grid">
                {BOOST_PLANS.map(plan => (
                  <div key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{ background: selectedPlan === plan.id ? 'rgba(255,85,0,0.1)' : '#12121e', borderRadius: '16px', padding: '24px', border: `1.5px solid ${selectedPlan === plan.id ? '#ff5500' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'all .2s' }}>
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#ff5500', borderRadius: '20px', padding: '2px 12px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        POPULÁRNE
                      </div>
                    )}
                    <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{plan.label}</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#ff5500', marginBottom: '4px' }}>{plan.price}€</div>
                    <div style={{ fontSize: '13px', color: '#7878a0' }}>{plan.description}</div>
                  </div>
                ))}
              </div>

              {/* CO DOSTANES */}
              <div style={{ background: '#12121e', borderRadius: '16px', padding: '24px', border: '0.5px solid rgba(255,255,255,0.07)', marginBottom: '32px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Čo získaš s Boost:</div>
                {['🔝 Inzerát na vrchole prehľadu', '🔶 Oranžové zvýraznenie v gridu', '👁️ 5x väčšia viditeľnosť', '📊 Štatistiky zobrazení'].map(item => (
                  <div key={item} style={{ fontSize: '14px', color: '#7878a0', marginBottom: '8px' }}>{item}</div>
                ))}
              </div>

              <button
                onClick={handleBoost}
                disabled={!selectedListing || boosting}
                style={{ width: '100%', padding: '16px', background: selectedListing ? '#ff5500' : '#2a2a3e', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '18px', fontWeight: 700, cursor: selectedListing ? 'pointer' : 'not-allowed', opacity: boosting ? 0.7 : 1 }}>
                {boosting ? 'Aktivujem...' : `🚀 Aktivovať Boost — ${BOOST_PLANS.find(p => p.id === selectedPlan)?.price}€`}
              </button>

              <div style={{ fontSize: '12px', color: '#7878a0', textAlign: 'center', marginTop: '12px' }}>
                * Platba bude implementovaná cez Stripe v ďalšej verzii
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}