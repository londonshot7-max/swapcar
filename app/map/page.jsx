'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Map() {
  const [listings, setListings] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    fetchListings()
    loadMap()
    getUserLocation()
  }, [])

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .not('latitude', 'is', null)
    setListings(data || [])
    setLoading(false)
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }
  }

  const loadMap = () => {
    if (document.getElementById('leaflet-css')) { setMapLoaded(true); return }
    const css = document.createElement('link')
    css.id = 'leaflet-css'
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setMapLoaded(true)
    document.head.appendChild(script)
  }

  useEffect(() => {
    if (!mapLoaded || listings.length === 0) return

    const L = window.L
    if (!L) return

    const existing = document.getElementById('map')?._leaflet_id
    if (existing) return

    const map = L.map('map').setView([48.7, 19.5], 8)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    const icon = L.divIcon({
      className: '',
      html: `<div style="background:#ff5500;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚗</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    listings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return
      const marker = L.marker([listing.latitude, listing.longitude], { icon }).addTo(map)
      marker.on('click', () => setSelected(listing))
    })

    if (userLocation) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="background:#3b82f6;color:#fff;border-radius:50%;width:16px;height:16px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map).bindPopup('Tvoja poloha')
    }
  }, [mapLoaded, listings])

  return (
    <>
      <style>{`
        .map-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        #map { width: 100%; height: calc(100vh - 68px); }
        .map-sidebar { position: absolute; top: 80px; right: 16px; width: 300px; background: #12121e; border-radius: 16px; border: 0.5px solid rgba(255,255,255,0.07); padding: 20px; z-index: 1000; }
        .map-stats { position: absolute; top: 80px; left: 16px; background: #12121e; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); padding: 12px 16px; z-index: 1000; }
        @media (max-width: 768px) {
          .map-nav { padding: 0 16px; }
          .map-sidebar { width: calc(100% - 32px); top: auto; bottom: 16px; right: 16px; }
          .map-stats { display: none; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="map-nav" style={{ position: 'relative', zIndex: 1001 }}>
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/browse"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>← Prehľad</button></Link>
        </nav>

        <div style={{ position: 'relative' }}>
          {loading ? (
            <div style={{ height: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0' }}>Načítavam mapu...</div>
          ) : (
            <div id="map"></div>
          )}

          {/* STATS */}
          <div className="map-stats">
            <div style={{ fontSize: '13px', color: '#7878a0' }}>Inzeráty na mape</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff5500' }}>{listings.length}</div>
          </div>

          {/* SELECTED LISTING */}
          {selected && (
            <div className="map-sidebar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Vybraný inzerát</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#7878a0', cursor: 'pointer', fontSize: '18px' }}>×</button>
              </div>
              {selected.images?.[0] && (
                <img src={selected.images[0]} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
              )}
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{selected.title}</div>
              <div style={{ fontSize: '13px', color: '#7878a0', marginBottom: '8px' }}>{selected.year} · {selected.mileage?.toLocaleString()} km · {selected.fuel}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#ff5500', marginBottom: '16px' }}>{selected.price?.toLocaleString()} €</div>
              {selected.city && <div style={{ fontSize: '13px', color: '#7878a0', marginBottom: '12px' }}>📍 {selected.city}</div>}
              <Link href={`/listing/${selected.id}`}>
                <button style={{ width: '100%', padding: '12px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Zobraziť inzerát
                </button>
              </Link>
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.07)', textAlign: 'center', zIndex: 1000 }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Žiadne inzeráty na mape</div>
              <div style={{ fontSize: '14px', color: '#7878a0' }}>Inzeráty sa zobrazia keď predajcovia pridajú lokalitu</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}