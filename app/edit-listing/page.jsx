'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { useParams, useRouter } from 'next/navigation'

const CAR_DATABASE = {
  'Audi': ['A1','A2','A3','A4','A5','A6','A7','A8','Q2','Q3','Q4','Q5','Q7','Q8','TT','R8','e-tron'],
  'BMW': ['116i','118i','120i','316i','318i','320d','320i','325i','330i','335i','418i','420d','520d','523i','525d','530d','535i','630i','730d','740i','M3','M4','M5','X1','X2','X3','X4','X5','X6','X7','Z4'],
  'Mercedes-Benz': ['A 180','A 200','B 180','B 200','C 180','C 200','C 220','C 250','E 200','E 220','E 250','E 300','S 350','S 500','GLA','GLB','GLC','GLE','GLS','CLA','CLS','SL','AMG GT'],
  'Volkswagen': ['Golf','Polo','Passat','Tiguan','Touareg','Touran','T-Roc','T-Cross','ID.3','ID.4','ID.5','Arteon','Caddy','Sharan'],
  'Škoda': ['Fabia','Octavia','Superb','Karoq','Kodiaq','Scala','Kamiq','Enyaq','Citigo','Rapid'],
  'Ford': ['Fiesta','Focus','Mondeo','Kuga','Puma','Mustang','Edge','Explorer','Transit'],
  'Opel': ['Corsa','Astra','Insignia','Mokka','Grandland','Crossland','Zafira'],
  'Toyota': ['Aygo','Yaris','Corolla','Camry','RAV4','C-HR','Land Cruiser','Prius','Hilux'],
  'Hyundai': ['i10','i20','i30','i40','Tucson','Santa Fe','Kona','Ioniq'],
  'Kia': ['Picanto','Rio','Ceed','Stinger','Sportage','Sorento','Niro','EV6'],
  'Tesla': ['Model 3','Model S','Model X','Model Y'],
  'Iná': [],
}

const BRANDS = Object.keys(CAR_DATABASE).sort()

export default function EditListing() {
  const { user, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState({ title:'', brand:'', model:'', year:'', mileage:'', fuel:'Benzín', transmission:'Manuálna', price:'', description:'', city:'' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (!user || !params.id) return
    const load = async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', params.id).eq('user_id', user.id).single()
      if (!data) { router.push('/profile'); return }
      setForm({
        title: data.title || '',
        brand: data.brand || '',
        model: data.model || '',
        year: data.year || '',
        mileage: data.mileage || '',
        fuel: data.fuel || 'Benzín',
        transmission: data.transmission || 'Manuálna',
        price: data.price || '',
        description: data.description || '',
        city: data.city || '',
      })
      setExistingImages(data.images || [])
    }
    load()
  }, [user, params.id])

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const imageUrls = [...existingImages]
    for (const image of images) {
      const ext = image.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('listings').upload(path, image)
      if (!uploadError) {
        const { data } = supabase.storage.from('listings').getPublicUrl(path)
        imageUrls.push(data.publicUrl)
      }
    }

    const { error } = await supabase.from('listings').update({
      ...form,
      year: parseInt(form.year),
      mileage: parseInt(form.mileage),
      price: parseFloat(form.price),
      images: imageUrls,
    }).eq('id', params.id)

    if (error) { setError(error.message); setSaving(false) }
    else router.push('/profile')
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#12121e',
    border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    color: '#eeeaf4', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = { display: 'block', fontSize: '13px', color: '#7878a0', marginBottom: '8px' }
  const models = form.brand ? CAR_DATABASE[form.brand] || [] : []

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0' }}>Načítavam...</div>

  return (
    <>
      <style>{`
        .edit-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .edit-content { max-width: 700px; margin: 60px auto; padding: 0 20px; }
        .edit-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) {
          .edit-nav { padding: 0 16px; }
          .edit-content { margin: 32px auto; padding: 0 16px; }
          .edit-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="edit-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/profile"><div style={{ fontSize: '14px', color: '#7878a0' }}>← Späť na profil</div></Link>
        </nav>

        <div className="edit-content">
          <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>UPRAVIŤ<span style={{ color: '#ff5500' }}> INZERÁT</span></div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>Zmeň údaje o vozidle</div>

          {error && <div style={{ background: 'rgba(255,50,50,0.1)', padding: '12px', borderRadius: '8px', color: '#ff6666', marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* EXISTUJÚCE FOTKY */}
            {existingImages.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Existujúce fotky</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {existingImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button type="button" onClick={() => removeExistingImage(i)}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOVÉ FOTKY */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Pridať nové fotky</label>
              <input type="file" accept="image/*" multiple onChange={handleImages} style={{ ...inputStyle, cursor: 'pointer' }} />
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {previews.map((p, i) => <img key={i} src={p} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(255,85,0,0.3)' }} />)}
                </div>
              )}
            </div>

            {/* ZNAČKA */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Značka</label>
              <select value={form.brand} onChange={e => set('brand', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">-- Vyber značku --</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* MODEL */}
            {form.brand && (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Model</label>
                <select value={form.model} onChange={e => set('model', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">-- Vyber model --</option>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value={form.model}>{form.model}</option>
                </select>
              </div>
            )}

            {/* ROK + KM */}
            <div className="edit-grid-2" style={{ marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Rok výroby</label>
                <input type="number" value={form.year} onChange={e => set('year', e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Počet km</label>
                <input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} required style={inputStyle} />
              </div>
            </div>

            {/* PALIVO + PREVODOVKA */}
            <div className="edit-grid-2" style={{ marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Palivo</label>
                <select value={form.fuel} onChange={e => set('fuel', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="Benzín">Benzín</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Elektro">Elektro</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="LPG">LPG</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Prevodovka</label>
                <select value={form.transmission} onChange={e => set('transmission', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="Manuálna">Manuálna</option>
                  <option value="Automat">Automat</option>
                </select>
              </div>
            </div>

            {/* CENA */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Cena (€)</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required style={inputStyle} />
            </div>

            {/* MESTO */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Mesto</label>
              <input type="text" placeholder="Bratislava" value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} />
            </div>

            {/* NÁZOV */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Názov inzerátu</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required style={inputStyle} />
            </div>

            {/* POPIS */}
            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>Popis</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={saving}
                style={{ flex: 1, padding: '16px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '18px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Ukladám...' : '💾 Uložiť zmeny'}
              </button>
              <Link href="/profile">
                <button type="button" style={{ padding: '16px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#eeeaf4', fontSize: '16px', cursor: 'pointer' }}>
                  Zrušiť
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}