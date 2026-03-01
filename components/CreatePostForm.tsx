'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

type FormData = {
  category: string
  title: string
  description: string
  location: string
  country: string
  languages: string[]
  budgetType: string
  budgetMin?: number
  budgetMax?: number
  positions: number
  minFollowers?: number
  maxFollowers?: number
  platforms: string[]
  deadline?: string
  deliverables?: string
  timeline?: string
}

export default function CreatePostForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      positions: 1,
      budgetType: 'FIXED',
    },
  })

  const budgetType = watch('budgetType')

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    )
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          platforms: selectedPlatforms,
          languages: selectedLanguages,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/post/${result.id}`)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create post')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          {...register('category', { required: 'Category is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select a category</option>
          <option value="fashion">Fashion</option>
          <option value="beauty">Beauty</option>
          <option value="tech">Tech</option>
          <option value="food">Food & Drink</option>
          <option value="travel">Travel</option>
          <option value="fitness">Fitness</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="gaming">Gaming</option>
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 10, message: 'Title must be at least 10 characters' },
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., Looking for Fashion Influencers for Summer Campaign"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 50, message: 'Description must be at least 50 characters' },
          })}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          placeholder="Describe your collaboration opportunity in detail..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">City/Region</label>
          <input
            type="text"
            {...register('location')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Los Angeles, Remote"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Country</label>
          <input
            type="text"
            {...register('country')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., United States"
          />
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium mb-2">Target Languages</label>
        <div className="flex flex-wrap gap-2">
          {['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                selectedLanguages.includes(lang)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Budget Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              {...register('budgetType')}
              value="FIXED"
              className="mr-2"
            />
            Fixed Payment
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              {...register('budgetType')}
              value="SAMPLE"
              className="mr-2"
            />
            Product Sample
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              {...register('budgetType')}
              value="COMMISSION"
              className="mr-2"
            />
            Commission
          </label>
        </div>

        {budgetType !== 'SAMPLE' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Budget ($)</label>
              <input
                type="number"
                {...register('budgetMin', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Budget ($)</label>
              <input
                type="number"
                {...register('budgetMax', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Positions */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Number of Positions <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register('positions', {
            required: 'Number of positions is required',
            min: { value: 1, message: 'Must be at least 1' },
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
        />
        {errors.positions && (
          <p className="text-red-500 text-sm mt-1">{errors.positions.message}</p>
        )}
      </div>

      {/* Followers Range */}
      <div>
        <label className="block text-sm font-medium mb-2">Follower Range (Optional)</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              {...register('minFollowers', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              placeholder="Min followers"
            />
          </div>
          <div>
            <input
              type="number"
              {...register('maxFollowers', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              placeholder="Max followers"
            />
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Platforms <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter', 'LinkedIn'].map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                selectedPlatforms.includes(platform)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
        {selectedPlatforms.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">Select at least one platform</p>
        )}
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
        <input
          type="date"
          {...register('deadline')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Deliverables */}
      <div>
        <label className="block text-sm font-medium mb-2">Deliverables (Optional)</label>
        <textarea
          {...register('deliverables')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          placeholder="Describe what you expect from creators (e.g., 2 Instagram posts, 1 Reel, etc.)"
        />
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-medium mb-2">Timeline (Optional)</label>
        <input
          type="text"
          {...register('timeline')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., 2 weeks, 1 month"
        />
      </div>

      {/* Review Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          ℹ️ Your post will be reviewed before publishing. This usually takes 24-48 hours.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting || selectedPlatforms.length === 0}
          className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
