'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Compare() {
  const [listings, setListings] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false })
      setListings(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const toggleSelect = (listing) => {
    if (selected.find(s => s.id === listing.id)) {
      setSelected(selected.filter(s => s.id !== listing.id))
    } else if (selected.length < 3) {
      setSelected([...selected, listing])
    }
  }

  const filtered = listings.filter(l =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.brand?.toLowerCase().includes(search.toLowerCase())
  )

  const specs = [
    { label: 'Cena', key: 'price', format: v => `${v?.toLocaleString()} €` },
    { label: 'Rok', key: 'year', format: v => v },
    { label: 'Najazdené', key: 'mileage', format: v => `${v?.toLocaleString()} km` },
    { label: 'Palivo', key: 'fuel', format: v => v },
    { label: 'Prevodovka', key: 'transmission', format: v => v },
  ]

  const getBest = (key) => {
    if (selected.length < 2) return null
    if (key === 'price' || key === 'mileage') return Math.min(...selected.map(s => s[key]))
    if (key === 'year') return Math.max(...selected.map(s => s[key]))
    return null
  }

  return (
    <>
      <style>{`
        .compare-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .compare-content { padding: 60px 48px; }
        .compare-table { display: grid; gap: 0; border-radius: 16px; overflow: hidden; border: 0.5px solid rgba(255,255,255,0.07); }
        @media (max-width: 768px) {
          .compare-nav { padding: 0 16px; }
          .compare-content { padding: 24px 16px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="compare-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/browse"><div style={{ fontSize: '14px', color: '#7878a0' }}>← Späť na prehľad</div></Link>
        </nav>

        <div className="compare-content">
          <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>⚖️ POROVNÁVAČ</div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>Vyber 2-3 vozidlá na porovnanie</div>

          {/* SELECTED */}
          {selected.length > 0 && (
            <div style={{ background: '#12121e', borderRadius: '16px', padding: '24px', border: '0.5px solid rgba(255,85,0,0.2)', marginBottom: '32px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Vybrané vozidlá ({selected.length}/3)</div>

              {/* COMPARISON TABLE */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                  <thead>
                    <tr>
                      <td style={{ padding: '12px 16px', color: '#7878a0', fontSize: '13px', width: '120px' }}></td>
                      {selected.map(s => (
                        <td key={s.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{s.title}</div>
                          <button onClick={() => toggleSelect(s)} style={{ background: 'transparent', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '6px', color: '#ff6666', cursor: 'pointer', fontSize: '12px', padding: '2px 8px' }}>Odstrániť</button>
                        </td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* FOTO */}
                    <tr style={{ background: '#0a0a12' }}>
                      <td style={{ padding: '12px 16px', color: '#7878a0', fontSize: '13px' }}>Foto</td>
                      {selected.map(s => (
                        <td key={s.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ width: '100px', height: '70px', margin: '0 auto', borderRadius: '8px', overflow: 'hidden', background: '#181827' }}>
                            {s.images?.[0]
                              ? <img src={s.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>🚗</div>}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {specs.map((spec, i) => {
                      const best = getBest(spec.key)
                      return (
                        <tr key={spec.key} style={{ background: i % 2 === 0 ? '#12121e' : '#0a0a12' }}>
                          <td style={{ padding: '14px 16px', color: '#7878a0', fontSize: '13px', fontWeight: 500 }}>{spec.label}</td>
                          {selected.map(s => {
                            const val = s[spec.key]
                            const isBest = best !== null && val === best
                            return (
                              <td key={s.id} style={{ padding: '14px 16px', textAlign: 'center', fontSize: '15px', fontWeight: isBest ? 700 : 400, color: isBest ? '#22c55e' : '#eeeaf4' }}>
                                {spec.format(val)}
                                {isBest && <span style={{ fontSize: '11px', marginLeft: '4px' }}>✓</span>}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}

                    {/* LINK */}
                    <tr style={{ background: '#12121e' }}>
                      <td style={{ padding: '14px 16px', color: '#7878a0', fontSize: '13px' }}>Detail</td>
                      {selected.map(s => (
                        <td key={s.id} style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <Link href={`/listing/${s.id}`}>
                            <button style={{ padding: '8px 16px', background: '#ff5500', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                              Zobraziť
                            </button>
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SEARCH */}
          <div style={{ marginBottom: '20px' }}>
            <input
              style={{ width: '100%', padding: '14px 16px', background: '#12121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#eeeaf4', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Hľadaj vozidlo na porovnanie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* LIST */}
          {loading ? (
            <div style={{ color: '#7878a0' }}>Načítavam...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filtered.map(listing => {
                const isSelected = selected.find(s => s.id === listing.id)
                const isDisabled = selected.length >= 3 && !isSelected
                return (
                  <div key={listing.id}
                    onClick={() => !isDisabled && toggleSelect(listing)}
                    style={{ background: '#12121e', borderRadius: '12px', overflow: 'hidden', border: `1.5px solid ${isSelected ? '#ff5500' : 'rgba(255,255,255,0.07)'}`, cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.4 : 1, transition: 'all .2s' }}>
                    <div style={{ height: '140px', background: '#181827', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {listing.images?.[0]
                        ? <img src={listing.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ fontSize: '40px' }}>🚗</div>}
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ff5500', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                          ✓
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{listing.title}</div>
                      <div style={{ fontSize: '12px', color: '#7878a0', marginBottom: '8px' }}>{listing.year} · {listing.mileage?.toLocaleString()} km</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff5500' }}>{listing.price?.toLocaleString()} €</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}