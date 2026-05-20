'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { useRouter } from 'next/navigation'

const BRANDS = ['Audi','BMW','Mercedes-Benz','Volkswagen','Škoda','Ford','Opel','Peugeot','Renault','Toyota','Honda','Hyundai','Kia','Mazda','Nissan','Seat','Volvo','Porsche','Tesla','Iná']
const FUEL_TYPES = ['Benzín','Diesel','Elektro','Hybrid','LPG']

export default function Alerts() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ brand: '', model: '', price_max: '', year_min: '', fuel: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) fetchAlerts()
  }, [user])

  const fetchAlerts = async () => {
    const { data } = await supabase.from('alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setAlerts(data || [])
  }

  const saveAlert = async () => {
    setSaving(true)
    await supabase.from('alerts').insert({ user_id: user.id, ...form, price_max: form.price_max ? Number(form.price_max) : null, year_min: form.year_min ? Number(form.year_min) : null })
    setShowForm(false)
    setForm({ brand: '', model: '', price_max: '', year_min: '', fuel: '' })
    fetchAlerts()
    setSaving(false)
  }

  const deleteAlert = async (id) => {
    await supabase.from('alerts').delete().eq('id', id)
    fetchAlerts()
  }

  const inputStyle = {
    background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    color: '#eeeaf4', padding: '12px 16px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = { fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }

  const getAlertLabel = (alert) => {
    const parts = []
    if (alert.brand) parts.push(alert.brand)
    if (alert.model) parts.push(alert.model)
    if (alert.price_max) parts.push(`do ${alert.price_max.toLocaleString()} €`)
    if (alert.year_min) parts.push(`od ${alert.year_min}`)
    if (alert.fuel) parts.push(alert.fuel)
    return parts.join(' · ') || 'Všetky vozidlá'
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0' }}>Načítavam...</div>

  return (
    <>
      <style>{`
        .alerts-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .alerts-content { padding: 60px 48px; max-width: 700px; }
        .alerts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) {
          .alerts-nav { padding: 0 16px; }
          .alerts-content { padding: 24px 16px; }
          .alerts-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="alerts-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/dashboard"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>Dashboard</button></Link>
        </nav>

        <div className="alerts-content">
          <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>🔔 UPOZORNENIA</div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>Dostaneš notifikáciu keď sa objaví nové vozidlo</div>

          <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', marginBottom: '32px', fontSize: '15px' }}>
            {showForm ? 'Zrušiť' : '+ Nové upozornenie'}
          </button>

          {/* FORM */}
          {showForm && (
            <div style={{ background: '#12121e', borderRadius: '16px', padding: '28px', border: '0.5px solid rgba(255,85,0,0.2)', marginBottom: '32px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Nové upozornenie</div>
              <div className="alerts-grid">
                <div>
                  <label style={labelStyle}>Značka</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}>
                    <option value="">Všetky</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Model</label>
                  <input style={inputStyle} placeholder="napr. Golf, 320d..." value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Max. cena (€)</label>
                  <input style={inputStyle} type="number" placeholder="20000" value={form.price_max} onChange={e => setForm({ ...form, price_max: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Min. rok výroby</label>
                  <input style={inputStyle} type="number" placeholder="2015" value={form.year_min} onChange={e => setForm({ ...form, year_min: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Palivo</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })}>
                    <option value="">Všetky</option>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={saveAlert} disabled={saving} style={{ marginTop: '20px', padding: '12px 28px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Ukladám...' : '🔔 Uložiť upozornenie'}
              </button>
            </div>
          )}

          {/* ALERTS LIST */}
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#7878a0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Žiadne upozornenia</div>
              <div>Vytvor upozornenie a nepremeškáš žiadne vozidlo!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map(alert => (
                <div key={alert.id} style={{ background: '#12121e', borderRadius: '12px', padding: '20px', border: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>🔔 {getAlertLabel(alert)}</div>
                    <div style={{ fontSize: '12px', color: '#7878a0' }}>Vytvorené {new Date(alert.created_at).toLocaleDateString('sk')}</div>
                  </div>
                  <button onClick={() => deleteAlert(alert.id)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '8px', color: '#ff6666', cursor: 'pointer', fontSize: '13px' }}>
                    Zmazať
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}