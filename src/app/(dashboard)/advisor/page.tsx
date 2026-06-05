'use client'

import { useEffect, useState, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const QUICK_PROMPTS = [
  '¿Cuál es mi salud financiera actual?',
  '¿Dónde puedo reducir mis gastos?',
  '¿Cuánto debería ahorrar cada mes?',
  '¿Qué inversiones me recomiendas?',
  'Dame un plan para mejorar mis finanzas',
  '¿Cuál es mi tasa de ahorro ideal?',
]

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm mr-3 mt-1 flex-shrink-0">
          🤖
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-green-500/20 border border-green-500/30 text-white rounded-tr-sm'
            : 'bg-[#0d1a0d] border border-green-900/50 text-gray-100 rounded-tl-sm'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        <p className="text-xs text-gray-600 mt-1">
          {new Date(message.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-green-500/30 flex items-center justify-center text-sm ml-3 mt-1 flex-shrink-0">
          👤
        </div>
      )}
    </div>
  )
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetch('/api/ai')
      .then(r => r.json())
      .then(data => {
        setMessages(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || sending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      })

      const data = await res.json()

      if (res.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          createdAt: new Date().toISOString(),
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '❌ Error al conectar con el asesor. Por favor, verifica tu API key de Anthropic.',
          createdAt: new Date().toISOString(),
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Error de conexión. Inténtalo de nuevo.',
        createdAt: new Date().toISOString(),
      }])
    }

    setSending(false)
  }

  const clearChat = async () => {
    if (!confirm('¿Limpiar toda la conversación?')) return
    await fetch('/api/ai', { method: 'DELETE' })
    setMessages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🤖 Asesor Financiero IA</h1>
          <p className="text-gray-400 mt-1">Powered by Claude — Consejos personalizados basados en tus datos</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-green-900/30 hover:border-red-500/30"
          >
            🗑️ Limpiar chat
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 animate-pulse">
              Cargando conversación...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-4xl mb-4">
                🤖
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Tu Asesor Financiero IA</h3>
              <p className="text-gray-400 max-w-md mb-8">
                Tengo acceso completo a tus datos financieros. Pregúntame sobre tus gastos,
                ahorros, inversiones o pídeme un análisis de tu salud financiera.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="text-left px-4 py-3 rounded-xl border border-green-900/50 text-gray-300 hover:text-white hover:border-green-500/50 hover:bg-green-500/5 transition-all text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {sending && (
                <div className="flex justify-start mb-4">
                  <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm mr-3 mt-1">
                    🤖
                  </div>
                  <div className="bg-[#0d1a0d] border border-green-900/50 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick prompts (when there are messages) */}
        {messages.length > 0 && (
          <div className="px-6 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-green-900/20">
            {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                disabled={sending}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-green-900/50 text-gray-400 hover:text-white hover:border-green-500/50 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-green-900/30">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntame sobre tus finanzas... (Enter para enviar)"
              className="flex-1 bg-black/30 border border-green-900/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 resize-none text-sm"
              rows={1}
              disabled={sending}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold px-5 py-3 rounded-xl transition-all"
            >
              {sending ? '...' : '→'}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            El asesor tiene acceso a todos tus datos financieros para darte consejos personalizados
          </p>
        </div>
      </div>
    </div>
  )
}
