'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useParams } from 'next/navigation'

export default function Listing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', params.id).single()
      setListing(data)
      setLoading(false)
    }
    fetchListing()
  }, [params.id])

  if (loading) return <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',display:'flex',alignItems:'center',justifyContent:'center'}}>Načítavam...</div>
  if (!listing) return <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',display:'flex',alignItems:'center',justifyContent:'center'}}>Inzerát nenájdený.</div>

  return (
    <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
        <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
        <Link href="/browse"><div style={{fontSize:'14px',color:'#7878a0'}}>Spat na prehlad</div></Link>
      </nav>

      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'60px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'40px'}}>
          <div>
            <div style={{height:'360px',background:'#12121e',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'80px',border:'0.5px solid rgba(255,255,255,0.07)'}}>
              🚗
            </div>
          </div>

          <div>
            <div style={{fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>{listing.brand} · {listing.model}</div>
            <div style={{fontSize:'32px',fontWeight:800,marginBottom:'16px'}}>{listing.title}</div>
            <div style={{fontSize:'40px',fontWeight:800,color:'#ff5500',marginBottom:'32px'}}>{listing.price?.toLocaleString()} €</div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'32px'}}>
              {[['Rok', listing.year],['Najazdene', `${listing.mileage?.toLocaleString()} km`],['Palivo', listing.fuel],['Prevodovka', listing.transmission]].map(([label, value]) => (
                <div key={label} style={{background:'#12121e',borderRadius:'10px',padding:'16px',border:'0.5px solid rgba(255,255,255,0.07)'}}>
                  <div style={{fontSize:'12px',color:'#7878a0',marginBottom:'4px'}}>{label}</div>
                  <div style={{fontSize:'16px',fontWeight:600}}>{value}</div>
                </div>
              ))}
            </div>

            <button style={{width:'100%',padding:'16px',background:'#ff5500',border:'none',borderRadius:'10px',color:'#fff',fontSize:'18px',fontWeight:700,cursor:'pointer',marginBottom:'12px'}}>
              Kontaktovat predajcu
            </button>
            <button style={{width:'100%',padding:'16px',background:'transparent',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'16px',cursor:'pointer'}}>
              Navrhnút výmenu
            </button>
          </div>
        </div>

        {listing.description && (
          <div style={{marginTop:'40px',background:'#12121e',borderRadius:'16px',padding:'32px',border:'0.5px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:'20px',fontWeight:700,marginBottom:'16px'}}>Popis</div>
            <div style={{fontSize:'15px',color:'#7878a0',lineHeight:'1.7'}}>{listing.description}</div>
          </div>
        )}
      </div>
    </div>
  )
}