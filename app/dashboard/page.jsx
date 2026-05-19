'use client'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
        <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
        <div style={{fontSize:'14px',color:'#7878a0'}}>Dashboard</div>
      </nav>
      <div style={{padding:'60px 48px'}}>
        <h1 style={{fontSize:'48px',fontWeight:800,marginBottom:'8px'}}>Vitaj! 👋</h1>
        <p style={{color:'#7878a0',marginBottom:'48px'}}>Tvoj SwapCar účet je aktívny.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',maxWidth:'900px'}}>
          <Link href="/add-listing"><div style={{background:'#12121e',borderRadius:'16px',padding:'32px',cursor:'pointer',border:'0.5px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:'32px',marginBottom:'16px'}}>➕</div>
            <div style={{fontSize:'20px',fontWeight:700}}>Pridať inzerát</div>
            <div style={{fontSize:'13px',color:'#7878a0',marginTop:'8px'}}>Predaj alebo vymeň vozidlo</div>
          </div></Link>
          <Link href="/browse"><div style={{background:'#12121e',borderRadius:'16px',padding:'32px',cursor:'pointer',border:'0.5px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:'32px',marginBottom:'16px'}}>🔍</div>
            <div style={{fontSize:'20px',fontWeight:700}}>Prehľadať vozidlá</div>
            <div style={{fontSize:'13px',color:'#7878a0',marginTop:'8px'}}>Nájdi svoje auto</div>
          </div></Link>
          <Link href="/auctions"><div style={{background:'#12121e',borderRadius:'16px',padding:'32px',cursor:'pointer',border:'0.5px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:'32px',marginBottom:'16px'}}>🔨</div>
            <div style={{fontSize:'20px',fontWeight:700}}>Živé dražby</div>
            <div style={{fontSize:'13px',color:'#7878a0',marginTop:'8px'}}>Draž autá v reálnom čase</div>
          </div></Link>
        </div>
      </div>
    </div>
  )
}