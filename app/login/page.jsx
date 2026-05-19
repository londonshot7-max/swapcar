'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Nespravny email alebo heslo.'); setLoading(false) }
    else { router.push('/dashboard') }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a12',display:'flex',flexDirection:'column',fontFamily:'sans-serif',color:'#eeeaf4'}}>
      <nav style={{display:'flex',alignItems:'center',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
        <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
      </nav>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
        <div style={{background:'#12121e',borderRadius:'20px',padding:'48px',width:'100%',maxWidth:'440px'}}>
          <div style={{fontSize:'40px',fontWeight:800,marginBottom:'8px'}}>PRIHLÁS<span style={{color:'#ff5500'}}>SA</span></div>
          <div style={{fontSize:'14px',color:'#7878a0',marginBottom:'36px'}}>Vitaj spat na SwapCar.sk</div>
          {error && <div style={{background:'rgba(255,50,50,0.1)',padding:'12px',borderRadius:'8px',color:'#ff6666',marginBottom:'20px'}}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Email</label>
              <input type="email" placeholder="tvoj@email.sk" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',padding:'12px 16px',background:'#181827',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}/>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Heslo</label>
              <input type="password" placeholder="Min. 8 znakov" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:'12px 16px',background:'#181827',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}/>
            </div>
            <button type="submit" disabled={loading} style={{width:'100%',padding:'14px',background:'#ff5500',border:'none',borderRadius:'10px',color:'#fff',fontSize:'20px',fontWeight:700,cursor:'pointer'}}>
              {loading ? 'PRIHLASUJEM...' : 'PRIHLASIT SA'}
            </button>
          </form>
          <div style={{textAlign:'center',fontSize:'14px',color:'#7878a0',marginTop:'24px'}}>
            Nemas ucet? <Link href="/register" style={{color:'#ff5500'}}>Registruj sa zadarmo</Link>
          </div>
        </div>
      </div>
    </div>
  )
}