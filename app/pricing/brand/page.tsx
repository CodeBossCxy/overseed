'use client'

import MainLayout from '@/components/MainLayout'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

const CheckIcon = () => (
  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function BrandPricingPage() {
  const { t, locale } = useLanguage()
  const { data: session } = useSession()
  const subscriptionTier = (session?.user as any)?.subscriptionTier || 'FREE'
  const isPro = subscriptionTier === 'PRO'
  const p = t.pricing.brand
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const rows = [
    { label: p.monthlyFee, free: '0', pro: `${p.proPrice}\n${p.proPriceAnnual}` },
    { label: p.translation, free: p.unlimited, pro: p.unlimited },
    { label: p.postsPerDay, free: '1', pro: '5' },
    { label: p.activeCampaigns, free: '3', pro: '30' },
    { label: p.newChatsPerDay, free: '10', pro: '30' },
    { label: p.teamSeats, free: '1', pro: '1' },
    { label: p.aiChat, free: p.notAvailable, pro: p.lightUsage },
  ]

  const faqs = [
    { q: p.faq1q, a: p.faq1a },
    { q: p.faq2q, a: p.faq2a },
    { q: p.faq3q, a: p.faq3a },
  ]

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{p.title}</h1>
          <p className="text-gray-600 text-lg">{p.subtitle}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{p.free}</h3>
              <p className="text-sm text-gray-500">{p.freePriceLabel}</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900">{locale === 'zh' ? '¥0' : '$0'}</span>
            </div>
            {session ? (
              !isPro ? (
                <div className="w-full py-3 text-center rounded-xl bg-gray-100 text-gray-600 font-medium text-sm">
                  {p.currentPlan}
                </div>
              ) : (
                <div className="w-full py-3 text-center rounded-xl bg-gray-50 text-gray-400 font-medium text-sm">
                  {p.free}
                </div>
              )
            ) : (
              <Link
                href="/auth/signup?type=brand"
                className="block w-full py-3 text-center rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
              >
                {p.getStarted}
              </Link>
            )}
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-primary-500 bg-white p-8 relative">
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">
              PRO
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{p.pro}</h3>
              <p className="text-sm text-gray-500">{p.proPriceAnnual}</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-gray-900">{p.proPriceDisplay}</span>
              <span className="text-gray-500 text-base ml-1">{p.perMonth}</span>
            </div>
            {session ? (
              isPro ? (
                <div className="w-full py-3 text-center rounded-xl bg-primary-50 text-primary-700 font-medium text-sm">
                  {p.currentPlan}
                </div>
              ) : (
                <Link
                  href="/dashboard/upgrade"
                  className="block w-full py-3 text-center rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition shadow-sm"
                >
                  {p.upgrade}
                </Link>
              )
            ) : (
              <Link
                href="/auth/signup?type=brand"
                className="block w-full py-3 text-center rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition shadow-sm"
              >
                {p.startWithPro}
              </Link>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden mb-16">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-sm font-semibold text-gray-700 px-6 py-4 w-1/3"></th>
                <th className="text-center text-sm font-semibold text-gray-700 px-6 py-4">{p.free}</th>
                <th className="text-center text-sm font-semibold text-primary-700 px-6 py-4 bg-primary-50/50">{p.pro}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{row.label}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">
                    <span className="whitespace-pre-line">{row.free}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium bg-primary-50/20">
                    <span className="whitespace-pre-line">{row.pro}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{p.faq}</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
                >
                  <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
