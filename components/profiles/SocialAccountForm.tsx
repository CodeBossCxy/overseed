'use client'

import { useState, useCallback } from 'react'

interface Platform {
  id: number
  name: string
  slug: string
}

interface SocialAccountFormProps {
  platforms: Platform[]
  existingPlatformIds: number[]
  onSuccess: () => void
  onCancel: () => void
  translations?: Record<string, string>
}

type Tab = 'url' | 'screenshot' | 'manual'

interface AnalysisResult {
  username?: string
  followerCount?: number
  followingCount?: number
  likesCount?: number
  postsCount?: number
  engagementRate?: number
  bio?: string
  platform?: string
  confidence: 'high' | 'medium' | 'low'
}

export default function SocialAccountForm({
  platforms,
  existingPlatformIds,
  onSuccess,
  onCancel,
  translations: t,
}: SocialAccountFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>('url')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL tab state
  const [urlInput, setUrlInput] = useState('')
  const [urlParsing, setUrlParsing] = useState(false)
  const [urlParsed, setUrlParsed] = useState<{
    platform: string
    platformId: number | null
    username: string
  } | null>(null)

  // Screenshot tab state
  const [screenshotPlatformId, setScreenshotPlatformId] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  // Shared form fields
  const [formData, setFormData] = useState({
    platformId: '',
    username: '',
    profileUrl: '',
    followerCount: '',
    likesCount: '',
    engagementRate: '',
  })

  const availablePlatforms = platforms.filter(
    (p) => !existingPlatformIds.includes(p.id)
  )

  const label = (key: string, fallback: string) => t?.[key] || fallback

  // URL parsing
  const handleUrlChange = useCallback(async (url: string) => {
    setUrlInput(url)
    setUrlParsed(null)
    setError(null)

    if (!url.trim()) return

    // Debounce-like: only parse if looks like a URL
    if (!url.includes('.') || url.length < 10) return

    setUrlParsing(true)
    try {
      const res = await fetch('/api/social-accounts/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || label('unsupportedUrl', 'Unsupported URL'))
        return
      }

      const data = await res.json()
      setUrlParsed(data)

      // Auto-populate form
      if (data.platformId) {
        setFormData((prev) => ({
          ...prev,
          platformId: String(data.platformId),
          username: data.username || prev.username,
          profileUrl: url.trim(),
        }))
      }
    } catch {
      setError(label('unsupportedUrl', 'Could not parse URL'))
    } finally {
      setUrlParsing(false)
    }
  }, [t])

  // Screenshot upload & analysis
  const handleScreenshotUpload = async (file: File) => {
    setScreenshotFile(file)
    setError(null)
    setAnalysisResult(null)

    if (!screenshotPlatformId) {
      setError(label('selectPlatformFirst', 'Please select a platform first'))
      return
    }

    const platform = platforms.find((p) => p.id === parseInt(screenshotPlatformId))
    if (!platform) return

    setIsAnalyzing(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('platformSlug', platform.slug)

      const res = await fetch('/api/social-accounts/analyze-screenshot', {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || label('analysisError', 'Analysis failed'))
        return
      }

      const data = await res.json()
      setScreenshotUrl(data.screenshotUrl)
      setAnalysisResult(data.analysis)

      // Pre-fill form with extracted data
      setFormData((prev) => ({
        ...prev,
        platformId: screenshotPlatformId,
        username: data.analysis.username || prev.username,
        followerCount: data.analysis.followerCount ? String(data.analysis.followerCount) : prev.followerCount,
        likesCount: data.analysis.likesCount ? String(data.analysis.likesCount) : prev.likesCount,
        engagementRate: data.analysis.engagementRate ? String(data.analysis.engagementRate) : prev.engagementRate,
      }))
    } catch {
      setError(label('analysisError', 'Failed to analyze screenshot'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleScreenshotUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleScreenshotUpload(file)
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const verificationMethod = activeTab === 'url' ? 'url' : activeTab === 'screenshot' ? 'screenshot' : 'manual'

      const body: Record<string, any> = {
        platformId: parseInt(formData.platformId),
        username: formData.username,
        profileUrl: formData.profileUrl || null,
        followerCount: formData.followerCount ? parseInt(formData.followerCount) : 0,
        engagementRate: formData.engagementRate ? parseFloat(formData.engagementRate) : null,
        verificationMethod,
      }

      if (formData.likesCount) {
        body.likesCount = parseInt(formData.likesCount)
      }

      if (activeTab === 'screenshot' && screenshotUrl) {
        body.screenshotUrl = screenshotUrl
      }

      const response = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add social account')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (availablePlatforms.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">You&apos;ve already linked all available platforms!</p>
        <button onClick={onCancel} className="mt-4 text-primary-600 hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'url', label: label('addViaUrl', 'Add via URL') },
    { key: 'screenshot', label: label('addViaScreenshot', 'Add via Screenshot') },
    { key: 'manual', label: label('manualEntry', 'Manual Entry') },
  ]

  const platformName = urlParsed
    ? platforms.find((p) => p.slug === urlParsed.platform)?.name || urlParsed.platform
    : null

  return (
    <div className="space-y-4">
      {/* Tab Pills */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key)
              setError(null)
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Tab */}
        {activeTab === 'url' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                {label('pasteUrl', 'Profile URL')}
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={label('urlPlaceholder', 'https://instagram.com/username')}
              />
              {urlParsing && (
                <p className="text-sm text-gray-500 mt-1">Parsing URL...</p>
              )}
              {urlParsed && (
                <p className="text-sm text-green-600 mt-1">
                  Detected: {platformName} - @{urlParsed.username}
                </p>
              )}
            </div>

            {urlParsed && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Platform</label>
                  <input
                    type="text"
                    value={platformName || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Username *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Follower Count</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.followerCount}
                      onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Engagement Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.engagementRate}
                      onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Screenshot Tab */}
        {activeTab === 'screenshot' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Platform *</label>
              <select
                required
                value={screenshotPlatformId}
                onChange={(e) => {
                  setScreenshotPlatformId(e.target.value)
                  setFormData({ ...formData, platformId: e.target.value })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a platform</option>
                {availablePlatforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
                dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => document.getElementById('screenshot-input')?.click()}
            >
              <input
                id="screenshot-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isAnalyzing ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-600">{label('analyzingScreenshot', 'Analyzing screenshot...')}</p>
                </div>
              ) : screenshotFile ? (
                <div className="space-y-1">
                  <svg className="w-8 h-8 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-gray-600">{screenshotFile.name}</p>
                  <p className="text-xs text-gray-400">Click or drop to replace</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">{label('uploadScreenshot', 'Upload a screenshot')}</p>
                  <p className="text-xs text-gray-400">{label('dragDropHint', 'Drag and drop or click to upload')}</p>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-900">{label('extractedData', 'Extracted Data')}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    analysisResult.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    analysisResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {label('confidence', 'Confidence')}: {analysisResult.confidence}
                  </span>
                </div>
                <p className="text-sm text-blue-700">{label('reviewData', 'Review and edit the extracted data below before saving.')}</p>
              </div>
            )}

            {analysisResult && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Follower Count</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.followerCount}
                      onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{label('likes', 'Likes')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.likesCount}
                      onChange={(e) => setFormData({ ...formData, likesCount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Engagement Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.engagementRate}
                    onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.0"
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Platform *</label>
              <select
                required
                value={formData.platformId}
                onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a platform</option>
                {availablePlatforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="yourusername"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Profile URL</label>
              <input
                type="url"
                value={formData.profileUrl}
                onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Follower Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.followerCount}
                  onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Engagement Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.engagementRate}
                  onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (activeTab === 'url' && !urlParsed) ||
              (activeTab === 'screenshot' && !analysisResult)
            }
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Account'}
          </button>
        </div>
      </form>
    </div>
  )
}
