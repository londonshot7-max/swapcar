'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const CAR_DATABASE = {
  'Audi': ['A1','A2','A3','A4','A5','A6','A7','A8','Q2','Q3','Q4','Q5','Q7','Q8','TT','R8','e-tron'],
  'BMW': ['116i','118i','120i','316i','318i','320d','320i','325i','330i','335i','418i','420d','520d','523i','525d','530d','535i','630i','730d','740i','M3','M4','M5','X1','X2','X3','X4','X5','X6','X7','Z4'],
  'Mercedes-Benz': ['A 180','A 200','B 180','B 200','C 180','C 200','C 220','C 250','E 200','E 220','E 250','E 300','S 350','S 500','GLA','GLB','GLC','GLE','GLS','CLA','CLS','SL','AMG GT'],
  'Volkswagen': ['Golf','Polo','Passat','Tiguan','Touareg','Touran','T-Roc','T-Cross','ID.3','ID.4','ID.5','Arteon','Caddy','Sharan','Phaeton'],
  'Škoda': ['Fabia','Octavia','Superb','Karoq','Kodiaq','Scala','Kamiq','Enyaq','Citigo','Rapid'],
  'Ford': ['Fiesta','Focus','Mondeo','Kuga','Puma','Mustang','Edge','Explorer','Transit','EcoSport'],
  'Opel': ['Corsa','Astra','Insignia','Mokka','Grandland','Crossland','Zafira','Meriva'],
  'Peugeot': ['108','208','308','408','508','2008','3008','5008','Partner'],
  'Renault': ['Clio','Megane','Laguna','Talisman','Captur','Kadjar','Koleos','Zoe','Scenic'],
  'Toyota': ['Aygo','Yaris','Corolla','Camry','RAV4','C-HR','Land Cruiser','Prius','Hilux','Supra'],
  'Honda': ['Jazz','Civic','Accord','CR-V','HR-V','e'],
  'Hyundai': ['i10','i20','i30','i40','Tucson','Santa Fe','Kona','Ioniq','ix35'],
  'Kia': ['Picanto','Rio','Ceed','ProCeed','Stinger','Sportage','Sorento','Niro','EV6'],
  'Mazda': ['Mazda2','Mazda3','Mazda6','CX-3','CX-5','CX-30','MX-5'],
  'Nissan': ['Micra','Juke','Qashqai','X-Trail','Leaf','370Z','GT-R'],
  'Seat': ['Ibiza','Leon','Arona','Ateca','Tarraco','Alhambra'],
  'Citroën': ['C1','C3','C4','C5','Berlingo','Jumper','C3 Aircross','C5 Aircross'],
  'Fiat': ['500','Panda','Punto','Tipo','Bravo','500X','500L','Ducato'],
  'Volvo': ['V40','V60','V90','S60','S90','XC40','XC60','XC90'],
  'Jeep': ['Renegade','Compass','Cherokee','Grand Cherokee','Wrangler'],
  'Land Rover': ['Defender','Discovery','Discovery Sport','Range Rover','Range Rover Sport','Range Rover Evoque'],
  'Porsche': ['911','Cayenne','Macan','Panamera','Taycan','Boxster','Cayman'],
  'Tesla': ['Model 3','Model S','Model X','Model Y','Cybertruck'],
  'Mitsubishi': ['ASX','Outlander','Eclipse Cross','L200','Pajero'],
  'Suzuki': ['Swift','Baleno','Vitara','S-Cross','Jimny'],
  'Dacia': ['Sandero','Logan','Duster','Lodgy','Spring'],
  'Alfa Romeo': ['Giulia','Stelvio','Giulietta','159','147'],
  'Subaru': ['Impreza','Legacy','Outback','Forester','XV','BRZ'],
  'Chevrolet': ['Spark','Aveo','Cruze','Malibu','Captiva','Camaro','Corvette'],
  'Dodge': ['Challenger','Charger','Durango','RAM'],
  'Lexus': ['IS','ES','LS','UX','NX','RX','GX','LX'],
  'Infiniti': ['Q30','Q50','Q60','QX30','QX50','QX70'],
  'Jaguar': ['E-Pace','F-Pace','I-Pace','XE','XF','XJ','F-Type'],
  'Mini': ['One','Cooper','Cooper S','Clubman','Countryman','Paceman'],
  'Smart': ['Fortwo','Forfour'],
  'Iná': [],
}

const BRANDS = Object.keys(CAR_DATABASE).sort()

export default function AddListing() {
  const [form, setForm] = useState({ title:'', brand:'', model:'', year:'', mileage:'', fuel:'Benzín', transmission:'Manuálna', price:'', description:'', city:'', latitude:null, longitude:null })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customModel, setCustomModel] = useState(false)
  const router = useRouter()

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleBrandChange = (brand) => {
    setForm(f => ({ ...f, brand, model: '', title: '' }))
    setCustomModel(false)
  }

  const handleModelChange = (model) => {
    if (model === '__custom__') {
      setCustomModel(true)
      setForm(f => ({ ...f, model: '' }))
    } else {
      setCustomModel(false)
      setForm(f => ({ ...f, model, title: `${f.brand} ${model} ${f.year}`.trim() }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Musíš byť prihlásený.'); setLoading(false); return }

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
      images: imageUrls,
      status: 'active',
    }])

    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#12121e',
    border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    color: '#eeeaf4', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block', fontSize: '13px', color: '#7878a0', marginBottom: '8px'
  }

  const models = form.brand ? CAR_DATABASE[form.brand] || [] : []

  return (
    <>
      <style>{`
        .add-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 68px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .add-content { max-width: 700px; margin: 60px auto; padding: 0 20px; }
        .add-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) {
          .add-nav { padding: 0 16px; }
          .add-content { margin: 32px auto; padding: 0 16px; }
          .add-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="add-nav">
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/dashboard"><div style={{ fontSize: '14px', color: '#7878a0' }}>← Späť na Dashboard</div></Link>
        </nav>

        <div className="add-content">
          <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>PRIDAJ<span style={{ color: '#ff5500' }}> INZERÁT</span></div>
          <div style={{ fontSize: '14px', color: '#7878a0', marginBottom: '40px' }}>Vyplň údaje o vozidle</div>

          {error && <div style={{ background: 'rgba(255,50,50,0.1)', padding: '12px', borderRadius: '8px', color: '#ff6666', marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* FOTKY */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Fotky vozidla</label>
              <input type="file" accept="image/*" multiple onChange={handleImages}
                style={{ ...inputStyle, cursor: 'pointer' }} />
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {previews.map((p, i) => (
                    <img key={i} src={p} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(255,85,0,0.3)' }} />
                  ))}
                </div>
              )}
            </div>

            {/* ZNAČKA */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Značka</label>
              <select value={form.brand} onChange={e => handleBrandChange(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">-- Vyber značku --</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* MODEL */}
            {form.brand && (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Model</label>
                {!customModel ? (
                  <select value={form.model} onChange={e => handleModelChange(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">-- Vyber model --</option>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                    <option value="__custom__">Iný model...</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="Zadaj model ručne" required style={inputStyle} />
                    <button type="button" onClick={() => setCustomModel(false)} style={{ padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#7878a0', cursor: 'pointer', whiteSpace: 'nowrap' }}>← Späť</button>
                  </div>
                )}
              </div>
            )}

            {/* ROK + KM */}
            <div className="add-grid-2" style={{ marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Rok výroby</label>
                <input type="number" placeholder="2020" value={form.year} onChange={e => { set('year', e.target.value); setForm(f => ({ ...f, year: e.target.value, title: `${f.brand} ${f.model} ${e.target.value}`.trim() })) }} required style={inputStyle} min="1990" max="2026" />
              </div>
              <div>
                <label style={labelStyle}>Počet km</label>
                <input type="number" placeholder="85000" value={form.mileage} onChange={e => set('mileage', e.target.value)} required style={inputStyle} />
              </div>
            </div>

            {/* PALIVO + PREVODOVKA */}
            <div className="add-grid-2" style={{ marginBottom: '20px' }}>
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
{/* MESTO + GPS */}
<div style={{ marginBottom: '20px' }}>
  <label style={labelStyle}>Mesto</label>
  <input
    style={inputStyle}
    placeholder="napr. Bratislava, Košice, Žilina..."
    value={form.city}
    onChange={async (e) => {
      set('city', e.target.value)
      if (e.target.value.length > 2) {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${e.target.value},Slovakia&format=json&limit=1`)
        const data = await res.json()
        if (data[0]) {
          set('latitude', parseFloat(data[0].lat))
          set('longitude', parseFloat(data[0].lon))
        }
      }
    }}
  />
</div>
            {/* CENA */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Cena (€)</label>
              <input type="number" placeholder="18500" value={form.price} onChange={e => set('price', e.target.value)} required style={inputStyle} />
            </div>

            {/* NÁZOV — auto-generovaný */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Názov inzerátu</label>
              <input type="text" placeholder="napr. BMW 320d xDrive 2020" value={form.title} onChange={e => set('title', e.target.value)} required style={inputStyle} />
              <div style={{ fontSize: '12px', color: '#7878a0', marginTop: '6px' }}>Automaticky vyplnené — môžeš upraviť</div>
            </div>

            {/* POPIS */}
            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>Popis</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Podrobný popis vozidla..." rows={5}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '16px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '22px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'PRIDÁVAM...' : 'PRIDAŤ INZERÁT'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}