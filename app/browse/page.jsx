'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const FUEL_TYPES = ['Všetky', 'Benzín', 'Diesel', 'Elektro', 'Hybrid', 'LPG']

export default function Browse() {
  const [listings, setListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [fuel, setFuel] = useState('Všetky')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [yearMax, setYearMax] = useState('')
  const [kmMax, setKmMax] = useState('')

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      setListings(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    fetchListings()
  }, [])

  useEffect(() => {
    let result = [...listings]

    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(l =>
        l.title?.toLowerCase().includes(s) ||
        l.brand?.toLowerCase().includes(s) ||
        l.model?.toLowerCase().includes(s)
      )
    }
    if (fuel !== 'Všetky') {
      result = result.filter(l => l.fuel === fuel)
    }
    if (priceMin) result = result.filter(l => l.price >= Number(priceMin))
    if (priceMax) result = result.filter(l => l.price <= Number(priceMax))
    if (yearMin) result = result.filter(l => l.year >= Number(yearMin))
    if (yearMax) result = result.filter(l => l.year <= Number(yearMax))
    if (kmMax) result = result.filter(l => l.mileage <= Number(kmMax))

    setFiltered(result)
  }, [search, fuel, priceMin, priceMax, yearMin, yearMax, kmMax, listings])

  const resetFilters = () => {
    setSearch('')
    setFuel('Všetky')
    setPriceMin('')
    setPriceMax('')
    setYearMin('')
    setYearMax('')
    setKmMax('')
  }

  const inputStyle = {
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#eeeaf4',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
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
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '68px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>Prihlasit sa</button></Link>
          <Link href="/add-listing"><button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ff5500', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Pridat inzerat</button></Link>
        </div>
      </nav>

      <div style={{ padding: '60px 48px' }}>
        <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>PREHLAD<span style={{ color: '#ff5500' }}> VOZIDIEL</span></div>
        <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>{filtered.length} inzerátov</div>

        {/* FILTER BOX */}
        <div style={{ background: '#12121e', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '36px' }}>

          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Hľadať</label>
            <input
              style={{ ...inputStyle, fontSize: '15px', padding: '12px 16px' }}
              placeholder="Napr. BMW, Golf, Tesla..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>

            {/* Palivo */}
            <div>
              <label style={labelStyle}>Palivo</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={fuel}
                onChange={e => setFuel(e.target.value)}
              >
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Cena od */}
            <div>
              <label style={labelStyle}>Cena od (€)</label>
              <input style={inputStyle} type="number" placeholder="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
            </div>

            {/* Cena do */}
            <div>
              <label style={labelStyle}>Cena do (€)</label>
              <input style={inputStyle} type="number" placeholder="999 999" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
            </div>

            {/* Rok od */}
            <div>
              <label style={labelStyle}>Rok od</label>
              <input style={inputStyle} type="number" placeholder="2000" value={yearMin} onChange={e => setYearMin(e.target.value)} />
            </div>

            {/* Rok do */}
            <div>
              <label style={labelStyle}>Rok do</label>
              <input style={inputStyle} type="number" placeholder="2025" value={yearMax} onChange={e => setYearMax(e.target.value)} />
            </div>

            {/* Max km */}
            <div>
              <label style={labelStyle}>Max. km</label>
              <input style={inputStyle} type="number" placeholder="300 000" value={kmMax} onChange={e => setKmMax(e.target.value)} />
            </div>
          </div>

          {/* Reset */}
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button
              onClick={resetFilters}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#7878a0', padding: '8px 20px', cursor: 'pointer', fontSize: '13px' }}
            >
              Zrušiť filtre
            </button>
          </div>
        </div>

        {/* GRID */}
        {loading && <div style={{ color: '#7878a0' }}>Načítavam...</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map(listing => (
            <Link href={`/listing/${listing.id}`} key={listing.id}>
              <div style={{ background: '#12121e', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all .2s' }}>
                <div style={{ height: '180px', background: '#181827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', overflow: 'hidden' }}>
                  {listing.images?.[0]
                    ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🚗'}
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{listing.title}</div>
                  <div style={{ fontSize: '13px', color: '#7878a0', marginBottom: '12px' }}>
                    {listing.year} · {listing.mileage?.toLocaleString()} km · {listing.fuel}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff5500' }}>{listing.price?.toLocaleString()} €</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#7878a0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Žiadne výsledky</div>
            <div style={{ marginBottom: '24px' }}>Skús zmeniť filtre</div>
            <button onClick={resetFilters} style={{ padding: '12px 32px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
              Zrušiť filtre
            </button>
          </div>
        )}
      </div>
    </div>
  )
}