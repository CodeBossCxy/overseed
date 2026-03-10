'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import MainLayout from '@/components/MainLayout'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const subscriptionTier = (session?.user as any)?.subscriptionTier || 'FREE'
  const isProUser = subscriptionTier === 'PRO'

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.ok
          ? data.content
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.aiAssistant.title}</h1>
          <p className="text-gray-600 text-sm mt-1">{t.aiAssistant.subtitle}</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden relative">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex justify-center items-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium mb-4">{t.aiAssistant.welcome}</p>
                  <div className="space-y-2 text-sm text-gray-500 text-left inline-block">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                      {t.aiAssistant.tip1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                      {t.aiAssistant.tip2}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                      {t.aiAssistant.tip3}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                      {t.aiAssistant.tip4}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">{t.aiAssistant.askAnything}</p>
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="text-sm leading-relaxed prose prose-sm prose-gray max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-gray-800">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    {t.aiAssistant.thinking}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Pro gate overlay for free users */}
          {!isProUser && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
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

          {/* Input area */}
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.aiAssistant.placeholder}
                disabled={!isProUser || isLoading}
                rows={1}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                style={{ maxHeight: '120px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !isProUser}
                className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
