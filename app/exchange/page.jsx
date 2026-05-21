'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'

function ExchangeContent() {
  const [exchanges, setExchanges] = useState([])
  const [myListings, setMyListings] = useState([])
  const [allListings, setAllListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ offering_listing_id: '', wanted_listing_id: '', extra_payment: '0', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchAllListings()
    if (user) {
      fetchMyListings()
      fetchExchanges()
      const wanted = searchParams.get('wanted')
      if (wanted) {
        setForm(f => ({ ...f, wanted_listing_id: wanted }))
        setShowForm(true)
      }
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchAllListings = async () => {
    const { data } = await supabase.from('listings').select('id, title, price, images, user_id').eq('status', 'active')
    setAllListings(data || [])
  }

  const fetchMyListings = async () => {
    const { data } = await supabase.from('listings').select('id, title, price').eq('user_id', user.id).eq('status', 'active')
    setMyListings(data || [])
  }

  const fetchExchanges = async () => {
    const { data } = await supabase
      .from('exchanges')
      .select(`*, offering:listings!offering_listing_id(title, images), wanted:listings!wanted_listing_id(title, images), offering_user:profiles!offering_user_id(full_name), wanted_user:profiles!wanted_user_id(full_name)`)
      .or(`offering_user_id.eq.${user.id},wanted_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    setExchanges(data || [])
    setLoading(false)
  }

  const submitExchange = async () => {
    if (!form.offering_listing_id || !form.wanted_listing_id) {
      setError('Vyber obe vozidlá')
      return
    }
    setSubmitting(true)
    setError('')
    const wantedListing = allListings.find(l => l.id === form.wanted_listing_id)
    const { error: err } = await supabase.from('exchanges').insert({
      offering_listing_id: form.offering_listing_id,
      wanted_listing_id: form.wanted_listing_id,
      offering_user_id: user.id,
      wanted_user_id: wantedListing?.user_id,
      extra_payment: Number(form.extra_payment),
      message: form.message,
    })
    if (err) { setError(err.message); setSubmitting(false) }
    else {
      setShowForm(false)
      setForm({ offering_listing_id: '', wanted_listing_id: '', extra_payment: '0', message: '' })
      fetchExchanges()
    }
    setSubmitting(false)
  }

  const respondExchange = async (id, status) => {
    await supabase.from('exchanges').update({ status }).eq('id', id)
    fetchExchanges()
  }

  const getStatusColor = (status) => {
    if (status === 'accepted') return '#22c55e'
    if (status === 'rejected') return '#ef4444'
    return '#ff5500'
  }

  const getStatusLabel = (status) => {
    if (status === 'accepted') return '✅ Prijatá'
    if (status === 'rejected') return '❌ Odmietnutá'
    return '⏳ Čakajúca'
  }

  const inputStyle = {
    background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    color: '#eeeaf4', padding: '12px 16px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block',
  }

  return (
    <>
      <style>{`
        .exchange-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .exchange-content { padding: 60px 48px; max-width: 900px; }
        @media (max-width: 768px) {
          .exchange-nav { padding: 0 16px; }
          .exchange-content { padding: 24px 16px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="exchange-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            {user && <Link href="/dashboard"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>Dashboard</button></Link>}
            {user && <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ff5500', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>🔄 Navrhnúť výmenu</button>}
          </div>
        </nav>

        <div className="exchange-content">
          <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>VÝMENY<span style={{ color: '#ff5500' }}> VOZIDIEL</span></div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>Vymeň svoje vozidlo za iné</div>

          {showForm && (
            <div style={{ background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,85,0,0.2)', marginBottom: '32px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Nový návrh výmeny</div>
              {error && <div style={{ background: 'rgba(255,50,50,0.1)', padding: '12px', borderRadius: '8px', color: '#ff6666', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Moje vozidlo (ponúkam)</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.offering_listing_id} onChange={e => setForm({ ...form, offering_listing_id: e.target.value })}>
                    <option value="">-- Vyber svoje vozidlo --</option>
                    {myListings.map(l => <option key={l.id} value={l.id}>{l.title} — {l.price?.toLocaleString()} €</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Vozidlo ktoré chcem (žiadam)</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.wanted_listing_id} onChange={e => setForm({ ...form, wanted_listing_id: e.target.value })}>
                    <option value="">-- Vyber vozidlo --</option>
                    {allListings.filter(l => l.user_id !== user?.id).map(l => <option key={l.id} value={l.id}>{l.title} — {l.price?.toLocaleString()} €</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Doplatok (€) — nepovinné</label>
                  <input style={inputStyle} type="number" placeholder="0" value={form.extra_payment} onChange={e => setForm({ ...form, extra_payment: e.target.value })} />
                  <div style={{ fontSize: '12px', color: '#7878a0', marginTop: '6px' }}>Kladná hodnota = ty doplácaš, záporná = oni doplácajú</div>
                </div>
                <div>
                  <label style={labelStyle}>Správa</label>
                  <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Pridaj správu k návrhu výmeny..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={submitExchange} disabled={submitting} style={{ flex: 1, padding: '14px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Posielam...' : '🔄 Odoslať návrh'}
                  </button>
                  <button onClick={() => setShowForm(false)} style={{ padding: '14px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#eeeaf4', cursor: 'pointer' }}>
                    Zrušiť
                  </button>
                </div>
              </div>
            </div>
          )}

          {!user ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#7878a0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
              <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Prihlás sa pre výmeny</div>
              <Link href="/login"><button style={{ padding: '12px 32px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '16px' }}>Prihlásiť sa</button></Link>
            </div>
          ) : loading ? (
            <div style={{ color: '#7878a0' }}>Načítavam...</div>
          ) : exchanges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#7878a0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
              <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Žiadne výmeny</div>
              <div>Navrhni výmenu svojho vozidla!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {exchanges.map(ex => (
                <div key={ex.id} style={{ background: '#12121e', borderRadius: '16px', padding: '24px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#7878a0' }}>
                      {ex.offering_user_id === user.id ? 'Môj návrh' : `Návrh od: ${ex.offering_user?.full_name}`}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: getStatusColor(ex.status) }}>
                      {getStatusLabel(ex.status)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, background: '#0a0a12', borderRadius: '10px', padding: '16px', minWidth: '200px' }}>
                      <div style={{ fontSize: '11px', color: '#7878a0', marginBottom: '4px' }}>PONÚKA</div>
                      <div style={{ fontWeight: 600 }}>{ex.offering?.title}</div>
                    </div>
                    <div style={{ fontSize: '24px' }}>🔄</div>
                    <div style={{ flex: 1, background: '#0a0a12', borderRadius: '10px', padding: '16px', minWidth: '200px' }}>
                      <div style={{ fontSize: '11px', color: '#7878a0', marginBottom: '4px' }}>ŽIADA</div>
                      <div style={{ fontWeight: 600 }}>{ex.wanted?.title}</div>
                    </div>
                  </div>
                  {ex.extra_payment !== 0 && (
                    <div style={{ marginTop: '12px', fontSize: '14px', color: '#7878a0' }}>
                      Doplatok: <span style={{ color: ex.extra_payment > 0 ? '#ff5500' : '#22c55e', fontWeight: 600 }}>
                        {ex.extra_payment > 0 ? `+${ex.extra_payment}` : ex.extra_payment} €
                      </span>
                    </div>
                  )}
                  {ex.message && (
                    <div style={{ marginTop: '12px', fontSize: '14px', color: '#7878a0', fontStyle: 'italic' }}>"{ex.message}"</div>
                  )}
                  {ex.status === 'pending' && ex.wanted_user_id === user.id && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button onClick={() => respondExchange(ex.id, 'accepted')} style={{ flex: 1, padding: '10px', background: '#22c55e', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                        ✅ Prijať
                      </button>
                      <button onClick={() => respondExchange(ex.id, 'rejected')} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
                        ❌ Odmietnuť
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function Exchange() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Načítavam...</div>}>
      <ExchangeContent />
    </Suspense>
  )
}