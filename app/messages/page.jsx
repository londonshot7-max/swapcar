'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setConversations([
        { id: 1, name: 'Jan Novak', car: 'BMW 320d 2020', message: 'Dobry den, mam zaujem o vase vozidlo...', time: 'pred 2h', unread: true },
        { id: 2, name: 'Peter Kovac', car: 'Audi A4 2019', message: 'Moze sa pozriet zajtra?', time: 'pred 5h', unread: false },
        { id: 3, name: 'Maria Horvath', car: 'VW Golf 2021', message: 'Dakujem za informacie!', time: 'vcera', unread: false },
      ])
      setLoading(false)
    }
    fetchConversations()
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'#0a0a12',color:'#eeeaf4',fontFamily:'sans-serif'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',height:'68px',borderBottom:'0.5px solid rgba(255,255,255,0.07)'}}>
        <Link href="/"><div style={{fontSize:'26px',fontWeight:800}}>SWAP<span style={{color:'#ff5500'}}>CAR</span>.SK</div></Link>
        <Link href="/dashboard"><div style={{fontSize:'14px',color:'#7878a0'}}>Dashboard</div></Link>
      </nav>

      <div style={{maxWidth:'800px',margin:'0 auto',padding:'60px 20px'}}>
        <div style={{fontSize:'40px',fontWeight:800,marginBottom:'8px'}}>SPRAVY</div>
        <div style={{fontSize:'14px',color:'#7878a0',marginBottom:'40px'}}>Tvoje konverzacie</div>

        {loading && <div style={{color:'#7878a0'}}>Načítavam...</div>}

        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {conversations.map(conv => (
            <div key={conv.id} style={{background:'#12121e',borderRadius:'16px',padding:'20px',border:`0.5px solid ${conv.unread ? 'rgba(255,85,0,0.3)' : 'rgba(255,255,255,0.07)'}`,cursor:'pointer',display:'flex',alignItems:'center',gap:'16px'}}>
              <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'#181827',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:700,flexShrink:0}}>
                {conv.name.charAt(0)}
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                  <div style={{fontWeight:600}}>{conv.name}</div>
                  <div style={{fontSize:'12px',color:'#7878a0'}}>{conv.time}</div>
                </div>
                <div style={{fontSize:'12px',color:'#ff5500',marginBottom:'4px'}}>{conv.car}</div>
                <div style={{fontSize:'13px',color:'#7878a0'}}>{conv.message}</div>
              </div>
              {conv.unread && <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#ff5500',flexShrink:0}}></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}