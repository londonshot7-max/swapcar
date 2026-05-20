'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddListing() {
  const [form, setForm] = useState({ title:'', brand:'', model:'', year:'', mileage:'', fuel:'benzin', transmission:'manual', price:'', description:'' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Musís byť prihlásený.'); setLoading(false); return }

    const imageUrls = []
    for (const image of images) {
      const ext = image.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('listings').upload(path, image)
      if (!uploadError) {
        const { data } = supabase.storage.from('listings').getPublicUrl(path)
        imageUrls.push(data.publicUrl)
      }
    }

    const { error } = await supabase.from('listings').insert([{
      ...form,
      user_id: user.id,
      year: parseInt(form.year),
      mileage: parseInt(form.mileage),
      price: parseFloat(form.price),
      images: imageUrls
    }])

    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard') }
  }

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  return (
    <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
        <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
        <Link href="/dashboard"><div style={{fontSize:'14px',color:'#7878a0'}}>Spat na Dashboard</div></Link>
      </nav>
      <div style={{maxWidth:'700px',margin:'60px auto',padding:'0 20px'}}>
        <div style={{fontSize:'40px',fontWeight:800,marginBottom:'8px'}}>PRIDAJ<span style={{color:'#ff5500'}}> INZERAT</span></div>
        <div style={{fontSize:'14px',color:'#7878a0',marginBottom:'40px'}}>Vyplň údaje o vozidle</div>
        {error && <div style={{background:'rgba(255,50,50,0.1)',padding:'12px',borderRadius:'8px',color:'#ff6666',marginBottom:'20px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Fotky vozidla</label>
            <input type="file" accept="image/*" multiple onChange={handleImages} style={{width:'100%',padding:'12px 16px',background:'#12121e',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px'}}/>
            {previews.length > 0 && (
              <div style={{display:'flex',gap:'8px',marginTop:'12px',flexWrap:'wrap'}}>
                {previews.map((p,i) => (
                  <img key={i} src={p} style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'8px'}}/>
                ))}
              </div>
            )}
          </div>

          {[['Nazov inzeratu','title','text','napr. BMW 320d xDrive 2020'],['Znacka','brand','text','napr. BMW'],['Model','model','text','napr. 320d'],['Rok vyroby','year','number','napr. 2020'],['Pocet km','mileage','number','napr. 85000'],['Cena (EUR)','price','number','napr. 18500']].map(([label,key,type,ph]) => (
            <div key={key} style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>{label}</label>
              <input type={type} placeholder={ph} value={form[key]} onChange={e=>set(key,e.target.value)} required style={{width:'100%',padding:'12px 16px',background:'#12121e',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}/>
            </div>
          ))}

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Palivo</label>
            <select value={form.fuel} onChange={e=>set('fuel',e.target.value)} style={{width:'100%',padding:'12px 16px',background:'#12121e',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}>
              <option value="benzin">Benzin</option>
              <option value="diesel">Diesel</option>
              <option value="elektro">Elektro</option>
              <option value="hybrid">Hybrid</option>
              <option value="lpg">LPG</option>
            </select>
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Prevodovka</label>
            <select value={form.transmission} onChange={e=>set('transmission',e.target.value)} style={{width:'100%',padding:'12px 16px',background:'#12121e',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none'}}>
              <option value="manual">Manualna</option>
              <option value="automat">Automat</option>
            </select>
          </div>

          <div style={{marginBottom:'32px'}}>
            <label style={{display:'block',fontSize:'13px',color:'#7878a0',marginBottom:'8px'}}>Popis</label>
            <textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Podrobny popis vozidla..." rows={5} style={{width:'100%',padding:'12px 16px',background:'#12121e',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'#eeeaf4',fontSize:'15px',outline:'none',resize:'vertical'}}/>
          </div>

          <button type="submit" disabled={loading} style={{width:'100%',padding:'16px',background:'#ff5500',border:'none',borderRadius:'10px',color:'#fff',fontSize:'22px',fontWeight:700,cursor:'pointer'}}>
            {loading ? 'PRIDAVAM...' : 'PRIDAT INZERAT'}
          </button>
        </form>
      </div>
    </div>
  )
}