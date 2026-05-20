'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
        :root {
          --bg: #0a0a12; --bg2: #0f0f1c; --card: #12121e; --card2: #181827;
          --orange: #ff5500; --orange2: #ff7733; --text: #eeeaf4;
          --muted: #7878a0; --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: 'Outfit', sans-serif; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 68px;
          background: rgba(10,10,18,0.92); backdrop-filter: blur(16px);
          border-bottom: 0.5px solid var(--border);
          transition: all .3s;
        }
        .logo { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 1px; }
        .logo span { color: var(--orange); }
        .nav-links { display: flex; gap: 32px; }
        .nav-links a { font-size: 14px; font-weight: 500; color: var(--muted); transition: color .2s; }
        .nav-links a:hover { color: var(--text); }
        .nav-btns { display: flex; gap: 12px; align-items: center; }
        .btn-ghost { padding: 8px 20px; border-radius: 8px; border: 1px solid var(--border2); font-size: 14px; font-weight: 500; color: var(--text); cursor: pointer; background: transparent; transition: all .2s; }
        .btn-ghost:hover { background: var(--card2); }
        .btn-primary { padding: 8px 20px; border-radius: 8px; border: none; background: var(--orange); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; }
        .btn-primary:hover { background: var(--orange2); transform: translateY(-1px); }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
        .hamburger span { display: block; width: 24px; height: 2px; background: var(--text); border-radius: 2px; transition: all .3s; }
        .mobile-menu { display: none; position: fixed; top: 68px; left: 0; right: 0; background: rgba(10,10,18,0.98); backdrop-filter: blur(16px); border-bottom: 0.5px solid var(--border); padding: 24px; z-index: 99; flex-direction: column; gap: 16px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-size: 16px; font-weight: 500; color: var(--muted); padding: 8px 0; border-bottom: 0.5px solid var(--border); }
        .mobile-menu .mobile-btns { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 120px 48px 80px; position: relative; overflow: hidden; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,85,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.04) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%); }
        .hero-glow { position: absolute; top: 20%; right: 5%; width: 600px; height: 600px; background: radial-gradient(ellipse, rgba(255,85,0,0.08) 0%, transparent 70%); pointer-events: none; }
        .hero-content { position: relative; max-width: 900px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,85,0,0.3); background: rgba(255,85,0,0.08); font-size: 13px; font-weight: 500; color: var(--orange2); margin-bottom: 28px; }
        .hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--orange); display: block; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        h1 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(72px, 10vw, 130px); font-weight: 800; line-height: 0.92; letter-spacing: -1px; color: var(--text); margin-bottom: 24px; }
        h1 .accent { color: var(--orange); }
        h1 .thin { font-weight: 400; color: var(--muted); }
        .hero-sub { font-size: 18px; color: var(--muted); max-width: 560px; margin-bottom: 40px; line-height: 1.7; }
        .hero-sub strong { color: var(--text); font-weight: 500; }
        .hero-cta { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        .btn-big { padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all .2s; border: none; font-family: 'Outfit', sans-serif; }
        .btn-big.primary { background: var(--orange); color: #fff; }
        .btn-big.primary:hover { background: var(--orange2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,85,0,0.3); }
        .btn-big.ghost { background: transparent; color: var(--text); border: 1px solid var(--border2); }
        .btn-big.ghost:hover { background: var(--card2); }
        .hero-trust { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--muted); }
        .trust-avatars { display: flex; }
        .trust-avatars span { width: 28px; height: 28px; border-radius: 50%; background: var(--card2); border: 2px solid var(--bg); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; margin-left: -8px; }
        .trust-avatars span:first-child { margin-left: 0; }
        .stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 0.5px solid var(--border); border-bottom: 0.5px solid var(--border); background: var(--bg2); }
        .stat-item { padding: 32px 48px; border-right: 0.5px solid var(--border); }
        .stat-item:last-child { border-right: none; }
        .stat-number { font-family: 'Barlow Condensed', sans-serif; font-size: 48px; font-weight: 800; color: var(--text); line-height: 1; }
        .stat-number span { color: var(--orange); }
        .stat-label { font-size: 13px; color: var(--muted); margin-top: 4px; }
        .features { padding: 100px 48px; }
        .features-header { text-align: center; margin-bottom: 64px; }
        .section-tag { display: inline-block; padding: 4px 12px; border-radius: 6px; background: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.2); font-size: 12px; font-weight: 600; color: var(--orange); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        h2 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(40px, 5vw, 64px); font-weight: 800; color: var(--text); }
        h2 .accent { color: var(--orange); }
        .section-sub { font-size: 16px; color: var(--muted); margin-top: 12px; max-width: 480px; margin-left: auto; margin-right: auto; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1200px; margin: 0 auto; }
        .feature-card { background: var(--card); border: 0.5px solid var(--border); border-radius: 16px; padding: 32px; transition: all .3s; }
        .feature-card:hover { border-color: rgba(255,85,0,0.3); transform: translateY(-4px); }
        .feature-card.highlight { border-color: rgba(255,85,0,0.2); background: linear-gradient(135deg, var(--card), rgba(255,85,0,0.05)); }
        .feature-icon { font-size: 32px; margin-bottom: 16px; }
        .feature-card h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .feature-card p { font-size: 14px; color: var(--muted); line-height: 1.6; }
        .feature-tag { display: inline-block; margin-top: 16px; padding: 3px 10px; border-radius: 6px; background: rgba(255,85,0,0.1); font-size: 11px; font-weight: 600; color: var(--orange); }
        .how-section { padding: 100px 48px; background: var(--bg2); }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1200px; margin: 64px auto 0; }
        .step { text-align: center; }
        .step-num { width: 48px; height: 48px; border-radius: 50%; background: var(--orange); color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .step h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .step p { font-size: 14px; color: var(--muted); line-height: 1.6; }
        .cta-banner { text-align: center; padding: 100px 48px; }
        .cta-banner h2 { font-size: clamp(48px, 6vw, 80px); }
        .cta-banner p { font-size: 17px; color: var(--muted); margin: 16px auto 36px; max-width: 480px; }
        .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-big-primary { padding: 16px 40px; background: var(--orange); border: none; border-radius: 12px; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; cursor: pointer; letter-spacing: 1px; transition: all .2s; }
        .btn-big-primary:hover { background: var(--orange2); transform: translateY(-2px); }
        .btn-big-ghost { padding: 16px 32px; background: transparent; border: 1px solid var(--border2); border-radius: 12px; color: var(--text); font-size: 16px; cursor: pointer; transition: all .2s; }
        .btn-big-ghost:hover { background: var(--card2); }
        footer { background: var(--bg); border-top: 0.5px solid var(--border); padding: 48px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
        .footer-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; }
        .footer-logo span { color: var(--orange); }
        .footer-desc { font-size: 13px; color: var(--muted); margin-top: 10px; line-height: 1.6; max-width: 220px; }
        .footer-col h5 { font-size: 12px; font-weight: 600; color: var(--text); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .footer-col a { display: block; font-size: 13px; color: var(--muted); margin-bottom: 8px; transition: color .2s; }
        .footer-col a:hover { color: var(--text); }
        .footer-bottom { padding: 20px 48px; border-top: 0.5px solid var(--border); display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); }

        @media (max-width: 768px) {
          .nav { padding: 0 20px; }
          .nav-links { display: none; }
          .nav-btns { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 100px 20px 60px; }
          .hero-sub { font-size: 15px; }
          .hero-cta { flex-direction: column; align-items: flex-start; gap: 12px; }
          .btn-big { width: 100%; text-align: center; }
          .hero-trust { font-size: 12px; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .stat-item { padding: 20px; border-right: 0.5px solid var(--border); }
          .stat-number { font-size: 36px; }
          .features { padding: 60px 20px; }
          .features-grid { grid-template-columns: 1fr; }
          .how-section { padding: 60px 20px; }
          .steps-grid { grid-template-columns: 1fr; gap: 24px; }
          .cta-banner { padding: 60px 20px; }
          .cta-btns { flex-direction: column; align-items: center; }
          .btn-big-primary, .btn-big-ghost { width: 100%; }
          footer { grid-template-columns: 1fr; padding: 32px 20px; gap: 24px; }
          .footer-bottom { padding: 16px 20px; flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/"><div className="logo">SWAP<span>CAR</span>.SK</div></Link>
        <div className="nav-links">
          <Link href="/browse">Vozidlá</Link>
          <Link href="/auctions">Dražby</Link>
          <Link href="/exchange">Výmeny</Link>
          <Link href="/showroom">Showroom</Link>
          <Link href="/how">Ako to funguje</Link>
        </div>
        <div className="nav-btns">
          <Link href="/login"><button className="btn-ghost">Prihlásiť sa</button></Link>
          <Link href="/register"><button className="btn-primary">Registrovať sa zadarmo</button></Link>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'}}></span>
          <span style={{opacity: menuOpen ? 0 : 1}}></span>
          <span style={{transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'}}></span>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/browse" onClick={() => setMenuOpen(false)}>Vozidlá</Link>
        <Link href="/auctions" onClick={() => setMenuOpen(false)}>Dražby</Link>
        <Link href="/exchange" onClick={() => setMenuOpen(false)}>Výmeny</Link>
        <Link href="/how" onClick={() => setMenuOpen(false)}>Ako to funguje</Link>
        <div className="mobile-btns">
          <Link href="/login" onClick={() => setMenuOpen(false)}><button className="btn-ghost" style={{width:'100%'}}>Prihlásiť sa</button></Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}><button className="btn-primary" style={{width:'100%',padding:'12px 20px'}}>Registrovať sa zadarmo</button></Link>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">Prvá slovenská platforma pre výmenu vozidiel</div>
          <h1>KÚP.<br /><span className="accent">PREDAJ.</span><br /><span className="thin">VYMEŇ.</span></h1>
          <p className="hero-sub">
            Autá, motorky, skútre. <strong>Dražby v reálnom čase.</strong> Výmena vozidla s doplatkom. Showroom komunita. Všetko na jednom mieste — len pre Slovensko.
          </p>
          <div className="hero-cta">
            <Link href="/browse"><button className="btn-big primary">Prehľadať vozidlá</button></Link>
            <Link href="/how"><button className="btn-big ghost">Ako to funguje →</button></Link>
            <div className="hero-trust">
              <div className="trust-avatars"><span>JK</span><span>MT</span><span>PB</span><span>+</span></div>
              Už 1 200+ registrovaných používateľov
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat-item"><div className="stat-number">3<span>,</span>840</div><div className="stat-label">Aktívnych inzerátov</div></div>
        <div className="stat-item"><div className="stat-number">218</div><div className="stat-label">Prebiehajúcich dražieb</div></div>
        <div className="stat-item"><div className="stat-number">94</div><div className="stat-label">Návrhov na výmenu</div></div>
        <div className="stat-item"><div className="stat-number">1<span>,</span>207</div><div className="stat-label">Dokončených transakcií</div></div>
      </div>

      {/* FEATURES */}
      <section className="features">
        <div className="features-header">
          <div className="section-tag">Prečo SwapCar</div>
          <h2>Funkcie, ktoré <span className="accent">nikde inde</span> nenájdeš</h2>
          <p className="section-sub">Nie sme ďalší klasický autobazár. Prinášame nový spôsob obchodovania s vozidlami.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card highlight">
            <div className="feature-icon">🔨</div>
            <h3>Dražby v reálnom čase</h3>
            <p>Nastav počiatočnú cenu a sleduj, ako záujemcovia súperia. Automatické príhozy, odpočítavanie, rezervná cena.</p>
            <div className="feature-tag">Jedinečné na SK</div>
          </div>
          <div className="feature-card highlight">
            <div className="feature-icon">🔄</div>
            <h3>Výmena s doplatkom</h3>
            <p>Navrhni výmenu svojho vozidla za iné. Dohodnte sa na doplatku — obojstranne. Platforma vygeneruje digitálnu zmluvu.</p>
            <div className="feature-tag">Jedinečné na SK</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏛️</div>
            <h3>Showroom komunita</h3>
            <p>Zdieľaj fotky svojich vozidiel, sleduj ostatných, zbieraj lajky. Tvoja garáž — tvoja identita na platforme.</p>
            <div className="feature-tag">Komunita</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Escrow platby</h3>
            <p>Peniaze sú bezpečne držané platformou do potvrdenia transakcie oboma stranami. Žiadne riziká.</p>
            <div className="feature-tag">Bezpečnosť</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Digitálna zmluva</h3>
            <p>Po potvrdení transakcie automaticky generujeme kúpnu zmluvu podľa slovenského práva.</p>
            <div className="feature-tag">Právna ochrana</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Hodnotenia predajcov</h3>
            <p>Každý predajca má verejný profil s hodnoteniami. Vieš s kým obchoduješ ešte pred prvou správou.</p>
            <div className="feature-tag">Dôveryhodnosť</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div style={{textAlign:'center'}}>
          <div className="section-tag">Jednoduché</div>
          <h2>Ako to <span className="accent">funguje?</span></h2>
        </div>
        <div className="steps-grid">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Registruj sa zadarmo</h3>
            <p>Vytvor účet za 2 minúty. Žiadna kreditná karta, žiadne skryté poplatky.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Pridaj vozidlo</h3>
            <p>Fotky, popis, cena. Vyber si medzi pevnou cenou, dražbou alebo výmenou.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Predaj bezpečne</h3>
            <p>Escrow platba, digitálna zmluva, hodnotenia. Celý proces pod kontrolou.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-banner">
        <h2>Začni predávať<br /><span className="accent">dnes. Zadarmo.</span></h2>
        <p>Registrácia trvá 2 minúty. Prvý inzerát môžeš mať živý ešte dnes.</p>
        <div className="cta-btns">
          <Link href="/register"><button className="btn-big-primary">REGISTROVAŤ SA</button></Link>
          <Link href="/browse"><button className="btn-big-ghost">Prehľadať vozidlá →</button></Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div>
          <div className="footer-logo">SWAP<span>CAR</span>.SK</div>
          <div className="footer-desc">Slovenská platforma pre nákup, predaj a výmenu vozidiel. Dražby, výmeny, komunita.</div>
        </div>
        <div className="footer-col">
          <h5>Platforma</h5>
          <Link href="/browse">Prehľadať vozidlá</Link>
          <Link href="/auctions">Živé dražby</Link>
          <Link href="/exchange">Výmeny</Link>
          <Link href="/showroom">Showroom</Link>
        </div>
        <div className="footer-col">
          <h5>Informácie</h5>
          <Link href="/how">Ako to funguje</Link>
          <Link href="/pricing">Cenník</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Kontakt</Link>
        </div>
        <div className="footer-col">
          <h5>Právne</h5>
          <Link href="/terms">Podmienky</Link>
          <Link href="/privacy">Ochrana dát</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </footer>
      <div className="footer-bottom">
        <div>© 2026 <span style={{color:'var(--orange)'}}>SwapCar.sk</span> — Všetky práva vyhradené</div>
        <div>Vyrobené na Slovensku 🇸🇰</div>
      </div>
    </>
  )
}