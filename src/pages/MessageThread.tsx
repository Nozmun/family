import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { SubPage } from '../components/SubPage'
import { uid, useAppDispatch, useAppState } from '../store'

export function MessageThread() {
  const { id } = useParams()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const conversation = state.conversations.find((c) => c.id === id)

  useEffect(() => {
    if (conversation && conversation.unread > 0) {
      dispatch({ type: 'markConversationRead', id: conversation.id })
    }
  }, [conversation, dispatch])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages.length])

  if (!conversation) {
    return (
      <SubPage title="Conversation">
        <div className="section">
          <div className="card empty">This conversation no longer exists.</div>
        </div>
      </SubPage>
    )
  }

  const onSend = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    dispatch({
      type: 'sendMessage',
      conversationId: conversation.id,
      message: { id: uid(), from: 'me', text: trimmed, sentAt: new Date().toISOString() },
    })
    setText('')
  }

  return (
    <SubPage title={conversation.withName}>
      <div className="thread" style={{ paddingBottom: 70 }}>
        {conversation.messages.map((m) => (
          <div key={m.id} className={`bubble ${m.from === 'me' ? 'bubble-me' : 'bubble-them'}`}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="composer" onSubmit={onSend}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          aria-label="Message"
        />
        <button type="submit">Send</button>
      </form>
    </SubPage>
  )
}
