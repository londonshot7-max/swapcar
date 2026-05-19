'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    if (error) { setError(error.message); setLoading(false) }
    else { setSuccess(true); setLoading(false) }
  }

  if (success) return (
    <div style={{minHeight:'100vh',background:'#0a0a12',display:'flex',alignItems:'center',justifyContent:'center',color:'#eeeaf4'}}>
      <div style={{textAlign:'center',padding:'48px'}}>
        <div style={{fontSize:'64px'}}>✉️</div>
        <h2 style={{fontSize:'36px',margin:'16px 0'}}>Skoro tam!</h2>
        <p style={{color:'#7878a0'}}>Potvrd email a prihlás sa.</p>
        <Link href="/login"><div style={{marginTop:'24px',display:'inline-block',padding:'12px 32px',background:'#ff5500',borderRadius:'10px',color:'#fff',fontWeight:700}}>PRIHLASIT SA</div></Link>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a12',display:'flex',flexDirection:'column',fontFamily:'sans-serif',color:'#eeeaf4'}}>
      <nav style={{display:'flex',alignItems:'center',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
        <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
      </nav>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
        <div style={{background:'#12121e',borderRadius:'20px',padding:'48px',width:'100%',maxWidth:'440px'}}>
          <div style={{fontSize:'40px',fontWeight:800,marginBottom:'8px'}}>REGISTRUJ<span style={{color:'#ff5500'}}>SA</span></div>
          <div style={{fontSize:'14px',color:'#7878a0',marginBottom:'36px'}}>Prvy inzerat mozes mat zivy este dnes</div>
          {error && <div style={{background:'rgba(255,50,50,0.1)',padding:'12px',borderRadius:'8px',color:'#ff6666',marginBottom:'20px'}}>{error}</div>}
          <form onSubmit={handleRegister}>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Meno</label>
              <input type="text" placeholder="Jan Novak" value={name} onChange={e=>setName(e.target.value)} required style={{width:'100%',padding:'12px 16px',background:'#181827',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}/>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Email</label>
              <input type="email" placeholder="tvoj@email.sk" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',padding:'12px 16px',background:'#181827',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}/>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Heslo</label>
              <input type="password" placeholder="Min. 8 znakov" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} style={{width:'100%',padding:'12px 16px',background:'#181827',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}/>
            </div>
            <button type="submit" disabled={loading} style={{width:'100%',padding:'14px',background:'#ff5500',border:'none',borderRadius:'10px',color:'#fff',fontSize:'20px',fontWeight:700,cursor:'pointer'}}>
              {loading ? 'REGISTRUJEM...' : 'REGISTROVAT SA ZADARMO'}
            </button>
          </form>
          <div style={{textAlign:'center',fontSize:'14px',color:'#7878a0',marginTop:'24px'}}>
            Uz mas ucet? <Link href="/login" style={{color:'#ff5500'}}>Prihlasit sa</Link>
          </div>
        </div>
      </div>
    </div>
  )
}