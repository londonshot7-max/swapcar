'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ full_name: '', phone: '', city: '', bio: '' })
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (prof) setProfile({ full_name: prof.full_name || '', phone: prof.phone || '', city: prof.city || '', bio: prof.bio || '' })

      const { data: myListings } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setListings(myListings || [])
      setLoading(false)
    }
    load()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, ...profile })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0' }}>
      Načítavam...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '68px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/dashboard"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>Dashboard</button></Link>
          <button onClick={logout} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ff5500', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Odhlásiť</button>
        </div>
      </nav>

      <div style={{ padding: '60px 48px', maxWidth: '900px' }}>
        <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '40px' }}>MÔJ<span style={{ color: '#ff5500' }}> PROFIL</span></div>

        {/* PROFIL FORM */}
        <div style={{ background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.07)', marginBottom: '32px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Osobné údaje</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Meno a priezvisko</label>
              <input style={inputStyle} placeholder="Ján Novák" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={{ ...inputStyle, opacity: 0.5 }} value={user?.email} disabled />
            </div>
            <div>
              <label style={labelStyle}>Telefón</label>
              <input style={inputStyle} placeholder="+421 900 000 000" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Mesto</label>
              <input style={inputStyle} placeholder="Bratislava" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>O mne</label>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              placeholder="Pár slov o sebe..."
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <button
            onClick={saveProfile}
            style={{ padding: '12px 32px', background: saved ? '#22c55e' : '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background .3s' }}
          >
            {saving ? 'Ukladám...' : saved ? '✓ Uložené!' : 'Uložiť profil'}
          </button>
        </div>

        {/* MOJE INZERÁTY */}
        <div style={{ background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Moje inzeráty ({listings.length})</div>
            <Link href="/add-listing"><button style={{ padding: '8px 20px', background: '#ff5500', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>+ Pridať</button></Link>
          </div>

          {listings.length === 0 ? (
            <div style={{ color: '#7878a0', textAlign: 'center', padding: '40px 0' }}>Zatiaľ žiadne inzeráty</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listings.map(l => (
                <Link href={`/listing/${l.id}`} key={l.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#0a0a12', borderRadius: '10px', border: '0.5px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{l.title}</div>
                      <div style={{ fontSize: '13px', color: '#7878a0' }}>{l.year} · {l.mileage?.toLocaleString()} km · {l.fuel}</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#ff5500' }}>{l.price?.toLocaleString()} €</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}