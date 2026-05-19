'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Browse() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false })
      setListings(data || [])
      setLoading(false)
    }
    fetchListings()
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
        <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
        <div style={{display:'flex',gap:'12px'}}>
          <Link href="/login"><button style={{padding:'8px 20px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'#eeeaf4',cursor:'pointer'}}>Prihlasit sa</button></Link>
          <Link href="/add-listing"><button style={{padding:'8px 20px',borderRadius:'8px',border:'none',background:'#ff5500',color:'#fff',cursor:'pointer',fontWeight:600}}>Pridat inzerat</button></Link>
        </div>
      </nav>

      <div style={{padding:'60px 48px'}}>
        <div style={{fontSize:'40px',fontWeight:800,marginBottom:'8px'}}>PREHLAD<span style={{color:'#ff5500'}}> VOZIDIEL</span></div>
        <div style={{fontSize:'14px',color:'#7878a0',marginBottom:'40px'}}>{listings.length} aktívnych inzerátov</div>

        {loading && <div style={{color:'#7878a0'}}>Načítavam...</div>}

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',gap:'20px'}}>
          {listings.map(listing => (
            <Link href={`/listing/${listing.id}`} key={listing.id}>
              <div style={{background:'#12121e',borderRadius:'16px',overflow:'hidden',border:'0.5px solid rgba(255,255,255,0.07)',cursor:'pointer',transition:'all .2s'}}>
                <div style={{height:'180px',background:'#181827',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>
                  🚗
                </div>
                <div style={{padding:'20px'}}>
                  <div style={{fontSize:'16px',fontWeight:600,marginBottom:'4px'}}>{listing.title}</div>
                  <div style={{fontSize:'13px',color:'#7878a0',marginBottom:'12px'}}>{listing.year} · {listing.mileage?.toLocaleString()} km · {listing.fuel}</div>
                  <div style={{fontSize:'24px',fontWeight:800,color:'#ff5500'}}>{listing.price?.toLocaleString()} €</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && listings.length === 0 && (
          <div style={{textAlign:'center',padding:'80px 0',color:'#7878a0'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>🚗</div>
            <div style={{fontSize:'20px',fontWeight:600,marginBottom:'8px'}}>Zatial ziadne inzeraty</div>
            <div style={{marginBottom:'24px'}}>Bud prvy kto prida vozidlo!</div>
            <Link href="/add-listing"><button style={{padding:'12px 32px',background:'#ff5500',border:'none',borderRadius:'10px',color:'#fff',fontSize:'16px',fontWeight:600,cursor:'pointer'}}>Pridat inzerat</button></Link>
          </div>
        )}
      </div>
    </div>
  )
}