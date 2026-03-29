'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import MainLayout from '@/components/MainLayout'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSummary {
  id: string
  title: string
  provider: string
  updatedAt: string
}

export default function AIAssistantPage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const subscriptionTier = (session?.user as any)?.subscriptionTier || 'FREE'
  const isProUser = subscriptionTier === 'PRO'

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<'openai' | 'claude'>('openai')
  const [chatId, setChatId] = useState<string | null>(null)
  const [chatList, setChatList] = useState<ChatSummary[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatList = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-chat/history')
      if (res.ok) setChatList(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    if (isProUser) loadChatList()
  }, [isProUser, loadChatList])

  const loadChat = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-chat/history/${id}`)
      if (res.ok) {
        const data = await res.json()
        setChatId(data.id)
        setProvider(data.provider === 'claude' ? 'claude' : 'openai')
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt),
          }))
        )
      }
    } catch {}
  }

  const startNewChat = () => {
    setChatId(null)
    setMessages([])
  }

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch('/api/ai-chat/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: id }),
      })
      setChatList((prev) => prev.filter((c) => c.id !== id))
      if (chatId === id) startNewChat()
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !isProUser) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantId = (Date.now() + 1).toString()

    // Add empty assistant message that will be filled by stream
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ])

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory, provider, chatId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: data.error || 'Something went wrong.' } : m
          )
        )
        setIsLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: 'Failed to read response.' } : m
          )
        )
        setIsLoading(false)
        return
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'meta' && event.chatId && !chatId) {
              setChatId(event.chatId)
            } else if (event.type === 'text') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + event.text } : m
                )
              )
            } else if (event.type === 'error') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content || event.error || 'Something went wrong.' }
                    : m
                )
              )
            }
          } catch {}
        }
      }

      loadChatList()
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content || 'Sorry, something went wrong. Please try again.' }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <MainLayout noFooter>
      <div className="h-full flex overflow-hidden">
        {/* Sidebar */}
        {isProUser && sidebarOpen && (
          <div className="w-72 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Sidebar header */}
            <div className="p-4 flex items-center justify-between">
              <button
                onClick={startNewChat}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-2 p-2 rounded-lg hover:bg-gray-200 transition text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {chatList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-xs">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chatList.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => loadChat(chat.id)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        chatId === chat.id
                          ? 'bg-primary-100/60 text-primary-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <img src="/icon-pink.png" alt="Overseed" className="w-7 h-7 rounded-lg flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate leading-tight">{chat.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(chat.updatedAt)}</p>
                      </div>
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 transition text-gray-300 hover:text-red-500 flex-shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              {isProUser && !sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-sm font-semibold text-gray-900">
                  {chatId ? (chatList.find(c => c.id === chatId)?.title || 'Chat') : t.aiAssistant.title}
                </h1>
                {!chatId && (
                  <p className="text-[11px] text-gray-400 leading-tight">{t.aiAssistant.subtitle}</p>
                )}
              </div>
            </div>

            {isProUser && (
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full p-0.5">
                <button
                  onClick={() => setProvider('openai')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    provider === 'openai'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${provider === 'openai' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  GPT-4o
                </button>
                <button
                  onClick={() => setProvider('claude')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    provider === 'claude'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${provider === 'claude' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  Claude
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {/* Welcome */}
              {messages.length === 0 && isProUser && (
                <div className="flex justify-center items-center min-h-[60vh]">
                  <div className="text-center max-w-md">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{t.aiAssistant.welcome}</h2>
                    <div className="grid grid-cols-2 gap-2 mt-6">
                      {[t.aiAssistant.tip1, t.aiAssistant.tip2, t.aiAssistant.tip3, t.aiAssistant.tip4].map((tip, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(tip)}
                          className="text-left p-3 rounded-xl border border-gray-200 hover:border-primary-200 hover:bg-primary-50/30 transition text-sm text-gray-600 leading-snug"
                        >
                          {tip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <img src="/icon-pink.png" alt="Overseed" className="w-7 h-7 rounded-lg flex-shrink-0 mt-0.5" />
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white max-w-[75%]'
                        : 'bg-gray-50 text-gray-800 max-w-[85%] border border-gray-100'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed prose prose-sm prose-gray max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-table:w-full prose-th:bg-gray-100 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:text-gray-700 prose-th:border prose-th:border-gray-200 prose-td:px-3 prose-td:py-2 prose-td:text-xs prose-td:border prose-td:border-gray-200">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading */}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-3">
                  <img src="/icon-pink.png" alt="Overseed" className="w-7 h-7 rounded-lg flex-shrink-0" />
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pro gate */}
          {!isProUser && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center px-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">{t.aiAssistant.proOnly}</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">{t.aiAssistant.proOnlyDesc}</p>
                <Link
                  href="/dashboard/upgrade"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition font-medium shadow-md"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 bg-white px-4 py-3 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.aiAssistant.placeholder}
                  disabled={!isProUser || isLoading}
                  rows={1}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !isProUser}
                  className="absolute right-2 bottom-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </button>
              </form>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                {provider === 'claude' ? 'Claude by Anthropic' : 'GPT-4o by OpenAI'} — responses may not always be accurate
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
