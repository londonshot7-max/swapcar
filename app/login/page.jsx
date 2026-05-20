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
    if (error) { setError('Nesprávny email alebo heslo.'); setLoading(false) }
    else { router.push('/dashboard') }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://www.swapcar.sk/dashboard' }
    })
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a12',display:'flex',flexDirection:'column',fontFamily:'sans-serif',color:'#eeeaf4'}}>
      <nav style={{display:'flex',alignItems:'center',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
        <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
      </nav>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
        <div style={{background:'#12121e',borderRadius:'20px',padding:'48px',width:'100%',maxWidth:'440px'}}>
          <div style={{fontSize:'40px',fontWeight:800,marginBottom:'8px'}}>PRIHLÁS<span style={{color:'#ff5500'}}>SA</span></div>
          <div style={{fontSize:'14px',color:'#7878a0',marginBottom:'36px'}}>Vitaj späť na SwapCar.sk</div>

          {error && <div style={{background:'rgba(255,50,50,0.1)',padding:'12px',borderRadius:'8px',color:'#ff6666',marginBottom:'20px'}}>{error}</div>}

          {/* GOOGLE */}
          <button
            onClick={handleGoogle}
            style={{width:'100%',padding:'12px',background:'#fff',border:'none',borderRadius:'10px',color:'#1a1a1a',fontSize:'15px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'24px'}}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Prihlásiť sa cez Google
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.07)'}}></div>
            <div style={{fontSize:'13px',color:'#7878a0'}}>alebo</div>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.07)'}}></div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Email</label>
              <input type="email" placeholder="tvoj@email.sk" value={email} onChange={e=>setEmail(e.target.value)} required
                style={{width:'100%',padding:'12px 16px',background:'#181827',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}/>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Heslo</label>
              <input type="password" placeholder="Min. 8 znakov" value={password} onChange={e=>setPassword(e.target.value)} required
                style={{width:'100%',padding:'12px 16px',background:'#181827',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}/>
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'14px',background:'#ff5500',border:'none',borderRadius:'10px',color:'#fff',fontSize:'20px',fontWeight:700,cursor:'pointer'}}>
              {loading ? 'PRIHLASUJEM...' : 'PRIHLÁSIŤ SA'}
            </button>
          </form>

          <div style={{textAlign:'center',fontSize:'14px',color:'#7878a0',marginTop:'24px'}}>
            Nemáš účet? <Link href="/register" style={{color:'#ff5500'}}>Registruj sa zadarmo</Link>
          </div>
        </div>
      </div>
    </div>
  )
}