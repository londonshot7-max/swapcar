'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { useRouter } from 'next/navigation'

export default function Messages() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (!user) return
    fetchConversations()
  }, [user])

  useEffect(() => {
    if (!activeConv) return
    fetchMessages(activeConv.id)

    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConv.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        scrollToBottom()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [activeConv])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select(`*, listing:listings(title), buyer:profiles!buyer_id(full_name), seller:profiles!seller_id(full_name)`)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
    setConversations(data || [])
  }

  const fetchMessages = async (convId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', user.id)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: newMessage.trim()
    })
    await supabase.from('conversations').update({
      last_message: newMessage.trim(),
      last_message_at: new Date().toISOString()
    }).eq('id', activeConv.id)
    setNewMessage('')
    setSending(false)
    fetchConversations()
  }

  const getOtherName = (conv) => {
    if (!conv) return ''
    return user?.id === conv.buyer_id ? conv.seller?.full_name : conv.buyer?.full_name
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('sk', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0' }}>
      Načítavam...
    </div>
  )

  return (
    <>
      <style>{`
        .msg-layout { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 68px); }
        .msg-sidebar { border-right: 0.5px solid rgba(255,255,255,0.07); overflow-y: auto; }
        .msg-main { display: flex; flex-direction: column; }
        @media (max-width: 768px) {
          .msg-layout { grid-template-columns: 1fr; }
          .msg-sidebar { display: ${activeConv ? 'none' : 'block'}; height: calc(100vh - 68px); }
          .msg-main { display: ${activeConv ? 'flex' : 'none'}; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#eeeaf4', fontFamily: 'sans-serif' }}>
        {/* NAV */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '68px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <Link href="/"><div style={{ fontSize: '26px', fontWeight: 800 }}>SWAP<span style={{ color: '#ff5500' }}>CAR</span>.SK</div></Link>
          <Link href="/dashboard"><button style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#eeeaf4', cursor: 'pointer' }}>Dashboard</button></Link>
        </nav>

        <div className="msg-layout">
          {/* SIDEBAR */}
          <div className="msg-sidebar">
            <div style={{ padding: '20px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>SPRÁVY</div>
              <div style={{ fontSize: '13px', color: '#7878a0', marginTop: '4px' }}>{conversations.length} konverzácií</div>
            </div>
            {conversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#7878a0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <div>Zatiaľ žiadne správy</div>
              </div>
            ) : (
              conversations.map(conv => (
                <div key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: activeConv?.id === conv.id ? '#12121e' : 'transparent', transition: 'background .2s' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#181827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, flexShrink: 0, color: '#ff5500' }}>
                      {getOtherName(conv)?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{getOtherName(conv) || 'Neznámy'}</div>
                      <div style={{ fontSize: '12px', color: '#ff5500', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.listing?.title}</div>
                      <div style={{ fontSize: '12px', color: '#7878a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message || 'Začni konverzáciu...'}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CHAT */}
          <div className="msg-main">
            {!activeConv ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7878a0', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '48px' }}>💬</div>
                <div>Vyber konverzáciu</div>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}
                <div style={{ padding: '16px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setActiveConv(null)} style={{ background: 'none', border: 'none', color: '#7878a0', cursor: 'pointer', fontSize: '20px', display: 'none' }} className="back-btn">←</button>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#181827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#ff5500' }}>
                    {getOtherName(activeConv)?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{getOtherName(activeConv) || 'Neznámy'}</div>
                    <div style={{ fontSize: '12px', color: '#ff5500' }}>{activeConv.listing?.title}</div>
                  </div>
                </div>

                {/* MESSAGES */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#7878a0', marginTop: '40px' }}>Začni konverzáciu!</div>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', padding: '12px 16px', borderRadius: msg.sender_id === user.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.sender_id === user.id ? '#ff5500' : '#12121e',
                        border: msg.sender_id === user.id ? 'none' : '0.5px solid rgba(255,255,255,0.07)'
                      }}>
                        <div style={{ fontSize: '14px' }}>{msg.content}</div>
                        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>{formatTime(msg.created_at)}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT */}
                <div style={{ padding: '16px 24px', borderTop: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', gap: '12px' }}>
                  <input
                    style={{ flex: 1, background: '#12121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#eeeaf4', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
                    placeholder="Napíš správu..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    style={{ padding: '12px 24px', background: '#ff5500', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: sending || !newMessage.trim() ? 0.5 : 1 }}>
                    Odoslať
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}