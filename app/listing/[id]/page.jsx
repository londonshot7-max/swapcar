'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { useParams, useRouter } from 'next/navigation'

export default function Listing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [contacting, setContacting] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', params.id).single()
      setListing(data)
      setLoading(false)
    }
    fetchListing()
  }, [params.id])

  const contactSeller = async () => {
    if (!user) { router.push('/login'); return }
    if (user.id === listing.user_id) return

    setContacting(true)

    // Skontroluj či konverzácia už existuje
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('buyer_id', user.id)
      .eq('seller_id', listing.user_id)
      .single()

    if (existing) {
      router.push('/messages')
      return
    }

    // Vytvor novú konverzáciu
    const { error } = await supabase.from('conversations').insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.user_id,
      last_message: 'Začiatok konverzácie',
    })

    if (!error) router.push('/messages')
    setContacting(false)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',display:'flex',alignItems:'center',justifyContent:'center'}}>Načítavam...</div>
  if (!listing) return <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',display:'flex',alignItems:'center',justifyContent:'center'}}>Inzerát nenájdený.</div>

  const images = listing.images || []
  const isOwner = user?.id === listing.user_id

  return (
    <>
      <style>{`
        .listing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        .listing-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
        @media (max-width: 768px) {
          .listing-grid { grid-template-columns: 1fr; gap: 24px; }
          .listing-nav { padding: 0 16px !important; }
          .listing-content { padding: 24px 16px !important; }
          .listing-main-img { height: 240px !important; }
        }
      `}</style>

      <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',fontFamily:'sans-serif'}}>
        <nav className="listing-nav" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
          <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
          <Link href="/browse"><div style={{fontSize:'14px',color:'#7878a0'}}>← Späť na prehľad</div></Link>
        </nav>

        <div className="listing-content" style={{maxWidth:'1100px',margin:'0 auto',padding:'60px 20px'}}>
          <div className="listing-grid">
            {/* FOTKY */}
            <div>
              <div className="listing-main-img" style={{height:'360px',background:'#12121e',borderRadius:'16px',overflow:'hidden',border:'0.5px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {images.length > 0
                  ? <img src={images[activeImg]} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <div style={{fontSize:'80px'}}>🚗</div>
                }
              </div>
              {images.length > 1 && (
                <div style={{display:'flex',gap:'8px',marginTop:'12px',flexWrap:'wrap'}}>
                  {images.map((img, i) => (
                    <img key={i} src={img} onClick={() => setActiveImg(i)}
                      style={{width:'72px',height:'72px',objectFit:'cover',borderRadius:'8px',cursor:'pointer',border: i === activeImg ? '2px solid #ff5500' : '2px solid transparent'}}/>
                  ))}
                </div>
              )}
            </div>

            {/* INFO */}
            <div>
              <div style={{fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>{listing.brand} · {listing.model}</div>
              <div style={{fontSize:'28px',fontWeight:800,marginBottom:'16px'}}>{listing.title}</div>
              <div style={{fontSize:'40px',fontWeight:800,color:'#ff5500',marginBottom:'32px'}}>{listing.price?.toLocaleString()} €</div>

              <div className="listing-specs">
                {[['Rok', listing.year],['Najazdené', `${listing.mileage?.toLocaleString()} km`],['Palivo', listing.fuel],['Prevodovka', listing.transmission]].map(([label, value]) => (
                  <div key={label} style={{background:'#12121e',borderRadius:'10px',padding:'16px',border:'0.5px solid rgba(255,255,255,0.07)'}}>
                    <div style={{fontSize:'12px',color:'#7878a0',marginBottom:'4px'}}>{label}</div>
                    <div style={{fontSize:'16px',fontWeight:600}}>{value}</div>
                  </div>
                ))}
              </div>

              {isOwner ? (
                <div style={{background:'#12121e',borderRadius:'10px',padding:'16px',border:'0.5px solid rgba(255,255,255,0.07)',textAlign:'center',color:'#7878a0',marginBottom:'12px'}}>
                  Toto je tvoj inzerát
                </div>
              ) : (
                <button
                  onClick={contactSeller}
                  disabled={contacting}
                  style={{width:'100%',padding:'16px',background:'#ff5500',border:'none',borderRadius:'10px',color:'#fff',fontSize:'18px',fontWeight:700,cursor:'pointer',marginBottom:'12px',opacity:contacting ? 0.7 : 1}}>
                  {contacting ? 'Presmerovávam...' : '💬 Kontaktovať predajcu'}
                </button>
              )}
              <button style={{width:'100%',padding:'16px',background:'transparent',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'16px',cursor:'pointer'}}>
                🔄 Navrhnúť výmenu
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
    </>
  )
}