'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { useRouter } from 'next/navigation'

export default function CreateAuction() {
  const [listings, setListings] = useState([])
  const [form, setForm] = useState({
    listing_id: '',
    start_price: '',
    min_increment: '100',
    reserve_price: '',
    duration_hours: '24',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    const fetchMyListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('status', 'active')
      setListings(data || [])
    }
    fetchMyListings()
  }, [user])

  const handleSubmit = async () => {
    if (!form.listing_id || !form.start_price) {
      setError('Vyber inzerát a nastav počiatočnú cenu')
      return
    }
    setLoading(true)
    setError('')

    const endTime = new Date()
    endTime.setHours(endTime.getHours() + Number(form.duration_hours))

    const { error: err } = await supabase.from('auctions').insert({
      listing_id: form.listing_id,
      seller_id: user.id,
      start_price: Number(form.start_price),
      current_price: Number(form.start_price),
      min_increment: Number(form.min_increment),
      reserve_price: form.reserve_price ? Number(form.reserve_price) : null,
      end_time: endTime.toISOString(),
    })

    if (err) { setError(err.message); setLoading(false) }
    else router.push('/auctions')
  }

  const inputStyle = {
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#eeeaf4',
    padding: '12px 16px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: '11px',
    color: '#7878a0',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <>
      <style>{`
        .create-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .create-content { padding: 60px 48px; max-width: 600px; }
        @media (max-width: 768px) {
          .create-nav { padding: 0 16px; }
          .create-content { padding: 24px 16px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="create-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/auctions"><div style={{ fontSize: '14px', color: '#7878a0' }}>← Späť na dražby</div></Link>
        </nav>

        <div className="create-content">
          <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>VYTVORIŤ<span style={{ color: '#ff5500' }}> DRAŽBU</span></div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>Nastav parametre dražby</div>

          <div style={{ background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {error && <div style={{ background: 'rgba(255,50,50,0.1)', padding: '12px', borderRadius: '8px', color: '#ff6666', fontSize: '14px' }}>{error}</div>}

            <div>
              <label style={labelStyle}>Vyber inzerát</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.listing_id} onChange={e => setForm({ ...form, listing_id: e.target.value })}>
                <option value="">-- Vyber vozidlo --</option>
                {listings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
              {listings.length === 0 && <div style={{ fontSize: '12px', color: '#7878a0', marginTop: '6px' }}>Nemáš žiadne aktívne inzeráty. <Link href="/add-listing" style={{ color: '#ff5500' }}>Pridaj inzerát</Link></div>}
            </div>

            <div>
              <label style={labelStyle}>Počiatočná cena (€)</label>
              <input style={inputStyle} type="number" placeholder="5000" value={form.start_price} onChange={e => setForm({ ...form, start_price: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Minimálny príhoz (€)</label>
              <input style={inputStyle} type="number" placeholder="100" value={form.min_increment} onChange={e => setForm({ ...form, min_increment: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Rezervná cena (€) — nepovinné</label>
              <input style={inputStyle} type="number" placeholder="Minimálna cena predaja" value={form.reserve_price} onChange={e => setForm({ ...form, reserve_price: e.target.value })} />
              <div style={{ fontSize: '12px', color: '#7878a0', marginTop: '6px' }}>Ak príhozy nedosiahnu túto cenu, vozidlo sa nepredá</div>
            </div>

            <div>
              <label style={labelStyle}>Trvanie dražby</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })}>
                <option value="6">6 hodín</option>
                <option value="12">12 hodín</option>
                <option value="24">24 hodín</option>
                <option value="48">2 dni</option>
                <option value="72">3 dni</option>
                <option value="168">7 dní</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding: '14px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Vytváram...' : '🔨 Spustiť dražbu'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}