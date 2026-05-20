'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0' }}>
      Načítavam...
    </div>
  )

  return (
    <>
      <style>{`
        .dash-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .dash-content { padding: 60px 48px; }
        .dash-title { font-size: 48px; font-weight: 800; margin-bottom: 8px; }
        .dash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1200px; }
        .dash-card { background: #12121e; border-radius: 16px; padding: 32px; cursor: pointer; border: 0.5px solid rgba(255,255,255,0.07); transition: all .2s; }
        .dash-card:hover { border-color: rgba(255,85,0,0.3); transform: translateY(-2px); }
        .dash-card-icon { font-size: 32px; margin-bottom: 16px; }
        .dash-card-title { font-size: 20px; font-weight: 700; }
        .dash-card-sub { font-size: 13px; color: #7878a0; margin-top: 8px; }
        @media (max-width: 768px) {
          .dash-nav { padding: 0 20px; }
          .dash-nav-label { display: none; }
          .dash-content { padding: 32px 16px; }
          .dash-title { font-size: 32px; }
          .dash-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .dash-card { padding: 20px; }
          .dash-card-icon { font-size: 24px; margin-bottom: 10px; }
          .dash-card-title { font-size: 16px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="dash-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/profile">
              <button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>
                👤 <span className="dash-nav-label">Profil</span>
              </button>
            </Link>
            <button onClick={logout} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ff5500', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Odhlásiť
            </button>
          </div>
        </nav>

        <div className="dash-content">
          <h1 className="dash-title">Vitaj! 👋</h1>
          <p style={{ color: '#7878a0', marginBottom: '48px' }}>Tvoj SwapCar účet je aktívny.</p>

          <div className="dash-grid">
            <Link href="/add-listing">
              <div className="dash-card">
                <div className="dash-card-icon">➕</div>
                <div className="dash-card-title">Pridať inzerát</div>
                <div className="dash-card-sub">Predaj alebo vymeň vozidlo</div>
              </div>
            </Link>
            <Link href="/browse">
              <div className="dash-card">
                <div className="dash-card-icon">🔍</div>
                <div className="dash-card-title">Prehľadať vozidlá</div>
                <div className="dash-card-sub">Nájdi svoje auto</div>
              </div>
            </Link>
            <Link href="/auctions">
              <div className="dash-card">
                <div className="dash-card-icon">🔨</div>
                <div className="dash-card-title">Živé dražby</div>
                <div className="dash-card-sub">Draž autá v reálnom čase</div>
              </div>
            </Link>
            <Link href="/exchange">
              <div className="dash-card">
                <div className="dash-card-icon">🔄</div>
                <div className="dash-card-title">Výmeny</div>
                <div className="dash-card-sub">Vymeň vozidlo za iné</div>
              </div>
            </Link>
            <Link href="/messages">
              <div className="dash-card">
                <div className="dash-card-icon">💬</div>
                <div className="dash-card-title">Správy</div>
                <div className="dash-card-sub">Tvoje konverzácie</div>
              </div>
            </Link>
            <Link href="/profile">
              <div className="dash-card">
                <div className="dash-card-icon">👤</div>
                <div className="dash-card-title">Môj profil</div>
                <div className="dash-card-sub">Upraviť údaje a inzeráty</div>
              </div>
            </Link>
            <Link href="/alerts">
              <div className="dash-card">
                <div className="dash-card-icon">🔔</div>
                <div className="dash-card-title">Upozornenia</div>
                <div className="dash-card-sub">Nové vozidlá podľa kritérií</div>
              </div>
            </Link>
            <Link href="/compare">
  <div className="dash-card">
    <div className="dash-card-icon">⚖️</div>
    <div className="dash-card-title">Porovnávač</div>
    <div className="dash-card-sub">Porovnaj až 3 vozidlá</div>
  </div>
</Link>
          </div>
        </div>
      </div>
    </>
  )
}