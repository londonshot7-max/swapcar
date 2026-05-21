'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'

export default function Profile() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState({ full_name: '', phone: '', city: '', bio: '', avatar_url: '' })
  const [listings, setListings] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) setProfile({ full_name: prof.full_name || '', phone: prof.phone || '', city: prof.city || '', bio: prof.bio || '', avatar_url: prof.avatar_url || '' })
      const { data: myListings } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setListings(myListings || [])
      setDataLoading(false)
    }
    load()
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, ...profile })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error } = await supabase.storage.from('listings').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('listings').getPublicUrl(path)
      const newUrl = data.publicUrl
      setProfile(p => ({ ...p, avatar_url: newUrl }))
      await supabase.from('profiles').update({ avatar_url: newUrl }).eq('id', user.id)
    }
    setUploadingAvatar(false)
  }

  const deleteListing = async (id) => {
    if (!confirm('Naozaj chceš zmazať tento inzerát?')) return
    setDeletingId(id)
    await supabase.from('listings').delete().eq('id', id)
    setListings(listings.filter(l => l.id !== id))
    setDeletingId(null)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading || dataLoading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0' }}>
      Načítavam...
    </div>
  )

  return (
    <>
      <style>{`
        .prof-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .prof-content { padding: 60px 48px; max-width: 1100px; }
        .prof-title { font-size: 40px; font-weight: 800; margin-bottom: 40px; }
        .prof-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .avatar-upload:hover .avatar-overlay { opacity: 1 !important; }
        @media (max-width: 768px) {
          .prof-nav { padding: 0 16px; }
          .prof-nav-label { display: none; }
          .prof-content { padding: 24px 16px; }
          .prof-title { font-size: 28px; margin-bottom: 24px; }
          .prof-form-grid { grid-template-columns: 1fr; gap: 14px; }
          .prof-card { padding: 20px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="prof-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/dashboard">
              <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer', fontSize: '14px' }}>
                <span className="prof-nav-label">Dashboard</span>
              </button>
            </Link>
            <button onClick={logout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ff5500', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              Odhlásiť
            </button>
          </div>
        </nav>

        <div className="prof-content">
          <div className="prof-title">MÔJ<span style={{ color: '#ff5500' }}> PROFIL</span></div>

          <div className="prof-card" style={{ background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.07)', marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Osobné údaje</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <label className="avatar-upload" style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1a1a2e', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '👤'}
                </div>
                <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s', fontSize: '20px' }}>
                  📷
                </div>
                <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} />
              </label>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{profile.full_name || 'Tvoje meno'}</div>
                <div style={{ fontSize: '13px', color: '#7878a0' }}>{uploadingAvatar ? '⏳ Nahrávam...' : 'Klikni na foto pre zmenu'}</div>
              </div>
            </div>

            <div className="prof-form-grid">
              <div>
                <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }}>Meno a priezvisko</label>
                <input style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '12px 16px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Ján Novák" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }}>Email</label>
                <input style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '12px 16px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box', opacity: 0.5 }}
                  value={user?.email} disabled />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }}>Telefón</label>
                <input style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '12px 16px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="+421 900 000 000" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }}>Mesto</label>
                <input style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '12px 16px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Bratislava" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }}>O mne</label>
              <textarea
                style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '12px 16px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical' }}
                placeholder="Pár slov o sebe..."
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <button onClick={saveProfile} style={{ padding: '12px 32px', background: saved ? '#22c55e' : '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background .3s', width: '100%' }}>
              {saving ? 'Ukladám...' : saved ? '✓ Uložené!' : 'Uložiť profil'}
            </button>
          </div>

          {/* MOJE INZERÁTY */}
          <div className="prof-card" style={{ background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Moje inzeráty ({listings.length})</div>
              <Link href="/add-listing"><button style={{ padding: '8px 16px', background: '#ff5500', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>+ Pridať</button></Link>
            </div>

            {listings.length === 0 ? (
              <div style={{ color: '#7878a0', textAlign: 'center', padding: '40px 0' }}>Zatiaľ žiadne inzeráty</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {listings.map(l => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#0a0a12', borderRadius: '10px', border: '0.5px solid rgba(255,255,255,0.07)', gap: '12px' }}>
                    <Link href={`/listing/${l.id}`} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                      <div style={{ fontSize: '13px', color: '#7878a0' }}>{l.year} · {l.mileage?.toLocaleString()} km</div>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff5500' }}>{l.price?.toLocaleString()} €</div>
                      <Link href={`/edit-listing/${l.id}`}>
                        <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#eeeaf4', cursor: 'pointer', fontSize: '12px' }}>
                          ✏️ Upraviť
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteListing(l.id)}
                        disabled={deletingId === l.id}
                        style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '6px', color: '#ff6666', cursor: 'pointer', fontSize: '12px', opacity: deletingId === l.id ? 0.5 : 1 }}>
                        {deletingId === l.id ? '...' : '🗑️ Zmazať'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}