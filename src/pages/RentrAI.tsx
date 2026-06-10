import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { answerQuestion } from '../ai'
import { BoltIcon } from '../components/icons'
import { uid, useAppDispatch, useAppState } from '../store'

const suggestions = [
  'What is my rental income?',
  'Any certificates expiring?',
  'Show my properties',
  'Any maintenance issues?',
]

export function RentrAI() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.aiMessages.length])

  const ask = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    dispatch({
      type: 'addAiMessages',
      messages: [
        { id: uid(), role: 'user', text: trimmed },
        { id: uid(), role: 'assistant', text: answerQuestion(state, trimmed) },
      ],
    })
    setText('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(text)
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <h1>
          <BoltIcon size={22} /> Rentr AI
        </h1>
      </div>
      <p className="page-sub">Your portfolio assistant — answers from your own data.</p>

      <div className="ai-suggestions">
        {suggestions.map((s) => (
          <button key={s} className="ai-suggestion" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="ai-thread" style={{ paddingBottom: 70 }}>
        {state.aiMessages.map((m) => (
          <div
            key={m.id}
            className={`bubble ${m.role === 'user' ? 'bubble-me' : 'bubble-them'}`}
          >
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask Rentr AI…"
          aria-label="Ask Rentr AI"
        />
        <button type="submit">Ask</button>
      </form>
    </div>
  )
}
