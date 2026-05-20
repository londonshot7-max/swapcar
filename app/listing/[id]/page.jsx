'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { useParams, useRouter } from 'next/navigation'

export default function Listing() {
  const [listing, setListing] = useState(null)
  const [seller, setSeller] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [contacting, setContacting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hoverStar, setHoverStar] = useState(0)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    fetchListing()
  }, [params.id])

  const fetchListing = async () => {
    const { data } = await supabase.from('listings').select('*').eq('id', params.id).single()
    setListing(data)
    if (data) {
      fetchSeller(data.user_id)
      fetchReviews(data.user_id)
    }
    setLoading(false)
  }

  const fetchSeller = async (sellerId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', sellerId).single()
    setSeller(data)
  }

  const fetchReviews = async (sellerId) => {
    const { data } = await supabase
      .from('reviews')
      .select(`*, reviewer:profiles!reviewer_id(full_name, avatar_url)`)
      .eq('reviewed_id', sellerId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  const contactSeller = async () => {
    if (!user) { router.push('/login'); return }
    if (user.id === listing.user_id) return
    setContacting(true)
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('buyer_id', user.id)
      .eq('seller_id', listing.user_id)
      .single()
    if (existing) { router.push('/messages'); return }
    const { error } = await supabase.from('conversations').insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.user_id,
      last_message: 'Začiatok konverzácie',
    })
    if (!error) router.push('/messages')
    setContacting(false)
  }

  const submitReview = async () => {
    if (!user) { router.push('/login'); return }
    setSubmittingReview(true)
    await supabase.from('reviews').insert({
      reviewer_id: user.id,
      reviewed_id: listing.user_id,
      listing_id: listing.id,
      rating,
      comment,
    })
    setShowReviewForm(false)
    setComment('')
    setRating(5)
    fetchReviews(listing.user_id)
    setSubmittingReview(false)
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Načítavam...</div>
  if (!listing) return <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Inzerát nenájdený.</div>

  const images = listing.images || []
  const isOwner = user?.id === listing.user_id

  return (
    <>
      <style>{`
        .listing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        .listing-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
        .star { cursor: pointer; font-size: 28px; transition: transform .1s; }
        .star:hover { transform: scale(1.2); }
        @media (max-width: 768px) {
          .listing-grid { grid-template-columns: 1fr; gap: 24px; }
          .listing-nav { padding: 0 16px !important; }
          .listing-content { padding: 24px 16px !important; }
          .listing-main-img { height: 240px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        <nav className="listing-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '68px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/browse"><div style={{ fontSize: '14px', color: '#7878a0' }}>← Späť na prehľad</div></Link>
        </nav>

        <div className="listing-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' }}>
          <div className="listing-grid">
            {/* FOTKY */}
            <div>
              <div className="listing-main-img" style={{ height: '360px', background: '#12121e', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {images.length > 0
                  ? <img src={images[activeImg]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ fontSize: '80px' }}>🚗</div>}
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <img key={i} src={img} onClick={() => setActiveImg(i)}
                      style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: i === activeImg ? '2px solid #ff5500' : '2px solid transparent' }} />
                  ))}
                </div>
              )}
            </div>

            {/* INFO */}
            <div>
              <div style={{ fontSize: '13px', color: '#7878a0', marginBottom: '8px' }}>{listing.brand} · {listing.model}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>{listing.title}</div>
              <div style={{ fontSize: '40px', fontWeight: 800, color: '#ff5500', marginBottom: '32px' }}>{listing.price?.toLocaleString()} €</div>

              <div className="listing-specs">
                {[['Rok', listing.year], ['Najazdené', `${listing.mileage?.toLocaleString()} km`], ['Palivo', listing.fuel], ['Prevodovka', listing.transmission]].map(([label, value]) => (
                  <div key={label} style={{ background: '#12121e', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: '12px', color: '#7878a0', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* PREDAJCA */}
              <div style={{ background: '#12121e', borderRadius: '12px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#181827', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {seller?.avatar_url ? <img src={seller.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{seller?.full_name || 'Predajca'}</span>
                    {seller?.verified && <span style={{ background: '#22c55e', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, color: '#fff' }}>✓ Overený</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7878a0' }}>
                    {avgRating ? `⭐ ${avgRating} (${reviews.length} hodnotení)` : 'Zatiaľ bez hodnotení'}
                  </div>
                </div>
              </div>

              {isOwner ? (
                <div style={{ background: '#12121e', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)', textAlign: 'center', color: '#7878a0', marginBottom: '12px' }}>
                  Toto je tvoj inzerát
                </div>
              ) : (
                <button onClick={contactSeller} disabled={contacting}
                  style={{ width: '100%', padding: '16px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '18px', fontWeight: 700, cursor: 'pointer', marginBottom: '12px', opacity: contacting ? 0.7 : 1 }}>
                  {contacting ? 'Presmerovávam...' : '💬 Kontaktovať predajcu'}
                </button>
              )}
              <button style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#eeeaf4', fontSize: '16px', cursor: 'pointer' }}>
                🔄 Navrhnúť výmenu
              </button>
            </div>
          </div>

          {/* POPIS */}
          {listing.description && (
            <div style={{ marginTop: '40px', background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Popis</div>
              <div style={{ fontSize: '15px', color: '#7878a0', lineHeight: '1.7' }}>{listing.description}</div>
            </div>
          )}

          {/* HODNOTENIA */}
          <div style={{ marginTop: '40px', background: '#12121e', borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>Hodnotenia predajcu</div>
                {avgRating && <div style={{ fontSize: '14px', color: '#7878a0', marginTop: '4px' }}>⭐ {avgRating} z 5 ({reviews.length} hodnotení)</div>}
              </div>
              {user && !isOwner && (
                <button onClick={() => setShowReviewForm(!showReviewForm)}
                  style={{ padding: '8px 20px', background: showReviewForm ? 'transparent' : '#ff5500', border: showReviewForm ? '1px solid rgba(255,255,255,0.12)' : 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                  {showReviewForm ? 'Zrušiť' : '⭐ Ohodnotiť'}
                </button>
              )}
            </div>

            {showReviewForm && (
              <div style={{ background: '#0a0a12', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '0.5px solid rgba(255,85,0,0.2)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Tvoje hodnotenie</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className="star"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverStar(s)}
                      onMouseLeave={() => setHoverStar(0)}>
                      {s <= (hoverStar || rating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Napíš hodnotenie..."
                  style={{ width: '100%', padding: '12px 16px', background: '#12121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#eeeaf4', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box' }}
                />
                <button onClick={submitReview} disabled={submittingReview}
                  style={{ marginTop: '12px', padding: '10px 24px', background: '#ff5500', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: submittingReview ? 0.7 : 1 }}>
                  {submittingReview ? 'Odosielam...' : 'Odoslať hodnotenie'}
                </button>
              </div>
            )}

            {reviews.length === 0 ? (
              <div style={{ color: '#7878a0', textAlign: 'center', padding: '40px 0' }}>Zatiaľ žiadne hodnotenia</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ padding: '16px', background: '#0a0a12', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#181827', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                          {review.reviewer?.avatar_url ? <img src={review.reviewer.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{review.reviewer?.full_name || 'Anonymný'}</div>
                      </div>
                      <div style={{ fontSize: '16px' }}>{'⭐'.repeat(review.rating)}</div>
                    </div>
                    {review.comment && <div style={{ fontSize: '14px', color: '#7878a0', lineHeight: '1.6' }}>{review.comment}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}