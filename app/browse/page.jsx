'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const FUEL_TYPES = ['Všetky', 'Benzín', 'Diesel', 'Elektro', 'Hybrid', 'LPG']

export default function Browse() {
  const [listings, setListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

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
    if (fuel !== 'Všetky') result = result.filter(l => l.fuel?.toLowerCase() === fuel.toLowerCase())
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

  const activeFiltersCount = [
    search, 
    fuel !== 'Všetky' ? fuel : '', 
    priceMin, priceMax, yearMin, yearMax, kmMax
  ].filter(Boolean).length

  return (
    <>
      <style>{`
        .browse-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .browse-content { padding: 60px 48px; }
        .filter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        .listing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .filter-toggle { display: none; }
        @media (max-width: 768px) {
          .browse-nav { padding: 0 20px; }
          .browse-nav-btns span { display: none; }
          .browse-content { padding: 24px 16px; }
          .browse-title { font-size: 28px !important; }
          .filter-toggle { display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; background: #12121e; border: 0.5px solid rgba(255,255,255,0.07); border-radius: 10px; color: #eeeaf4; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
          .filter-box { display: none; }
          .filter-box.open { display: block; }
          .filter-grid { grid-template-columns: 1fr 1fr; }
          .listing-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>

        {/* NAV */}
        <nav className="browse-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <div className="browse-nav-btns" style={{ display: 'flex', gap: '12px' }}>
            <Link href="/login"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>
              <span>Prihlásiť sa</span>
            </button></Link>
            <Link href="/add-listing"><button style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ff5500', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              + <span>Pridať inzerát</span>
            </button></Link>
          </div>
        </nav>

        <div className="browse-content">
          <div className="browse-title" style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>
            PREHĽAD<span style={{ color: '#ff5500' }}> VOZIDIEL</span>
          </div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '24px' }}>{filtered.length} inzerátov</div>

          {/* FILTER TOGGLE — mobile only */}
          <button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
            🔧 Filtre {activeFiltersCount > 0 && <span style={{ background: '#ff5500', borderRadius: '10px', padding: '1px 8px', fontSize: '12px' }}>{activeFiltersCount}</span>}
            <span style={{ marginLeft: 'auto' }}>{filtersOpen ? '▲' : '▼'}</span>
          </button>

          {/* FILTER BOX */}
          <div className={`filter-box ${filtersOpen ? 'open' : ''}`} style={{ background: '#12121e', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '36px' }}>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }}>Hľadať</label>
              <input
                style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '12px 16px', fontSize: '15px', width: '100%', outline: 'none' }}
                placeholder="Napr. BMW, Golf, Tesla..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-grid">
              {[
                { label: 'Palivo', isSelect: true },
                { label: 'Cena od (€)', placeholder: '0', value: priceMin, setter: setPriceMin },
                { label: 'Cena do (€)', placeholder: '999 999', value: priceMax, setter: setPriceMax },
                { label: 'Rok od', placeholder: '2000', value: yearMin, setter: setYearMin },
                { label: 'Rok do', placeholder: '2025', value: yearMax, setter: setYearMax },
                { label: 'Max. km', placeholder: '300 000', value: kmMax, setter: setKmMax },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ fontSize: '11px', color: '#7878a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                  {f.isSelect ? (
                    <select
                      style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '10px 14px', fontSize: '13px', width: '100%', outline: 'none', cursor: 'pointer' }}
                      value={fuel} onChange={e => setFuel(e.target.value)}
                    >
                      {FUEL_TYPES.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                    </select>
                  ) : (
                    <input
                      style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', padding: '10px 14px', fontSize: '13px', width: '100%', outline: 'none' }}
                      type="number" placeholder={f.placeholder} value={f.value} onChange={e => f.setter(e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button onClick={resetFilters} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#7878a0', padding: '8px 20px', cursor: 'pointer', fontSize: '13px' }}>
                Zrušiť filtre
              </button>
            </div>
          </div>

          {/* GRID */}
          {loading && <div style={{ color: '#7878a0' }}>Načítavam...</div>}

          <div className="listing-grid">
            {filtered.map(listing => (
              <Link href={`/listing/${listing.id}`} key={listing.id}>
                <div style={{ background: '#12121e', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ height: '180px', background: '#181827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', overflow: 'hidden' }}>
                    {listing.images?.[0]
                      ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🚗'}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {listing.verified_seller && <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>✓ Overený predajca</div>}{listing.title}</div>
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
    </>
  )
}