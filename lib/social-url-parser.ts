interface ParsedSocialUrl {
  platform: string
  username: string
}

const platformRules: {
  slugs: string[]
  hosts: string[]
  extract: (pathname: string) => string | null
}[] = [
  {
    slugs: ['instagram'],
    hosts: ['instagram.com', 'www.instagram.com'],
    extract: (p) => {
      const seg = p.split('/').filter(Boolean)[0]
      return seg && !['p', 'explore', 'reels', 'stories', 'accounts'].includes(seg) ? seg : null
    },
  },
  {
    slugs: ['tiktok'],
    hosts: ['tiktok.com', 'www.tiktok.com'],
    extract: (p) => {
      const seg = p.split('/').filter(Boolean)[0]
      return seg?.startsWith('@') ? seg.slice(1) : null
    },
  },
  {
    slugs: ['twitter'],
    hosts: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
    extract: (p) => {
      const seg = p.split('/').filter(Boolean)[0]
      return seg && !['home', 'explore', 'search', 'settings', 'i'].includes(seg) ? seg : null
    },
  },
  {
    slugs: ['facebook'],
    hosts: ['facebook.com', 'www.facebook.com', 'fb.com', 'www.fb.com'],
    extract: (p) => {
      const seg = p.split('/').filter(Boolean)[0]
      return seg && !['pages', 'groups', 'events', 'marketplace', 'watch', 'gaming'].includes(seg) ? seg : null
    },
  },
  {
    slugs: ['youtube'],
    hosts: ['youtube.com', 'www.youtube.com'],
    extract: (p) => {
      const parts = p.split('/').filter(Boolean)
      if (parts[0]?.startsWith('@')) return parts[0].slice(1)
      if (parts[0] === 'c' && parts[1]) return parts[1]
      if (parts[0] === 'channel' && parts[1]) return parts[1]
      return null
    },
  },
  {
    slugs: ['threads'],
    hosts: ['threads.net', 'www.threads.net'],
    extract: (p) => {
      const seg = p.split('/').filter(Boolean)[0]
      return seg?.startsWith('@') ? seg.slice(1) : null
    },
  },
  {
    slugs: ['linkedin'],
    hosts: ['linkedin.com', 'www.linkedin.com'],
    extract: (p) => {
      const parts = p.split('/').filter(Boolean)
      if (parts[0] === 'in' && parts[1]) return parts[1]
      return null
    },
  },
]

export function parseSocialUrl(url: string): ParsedSocialUrl | null {
  try {
    // Add protocol if missing
    let normalizedUrl = url.trim()
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    const parsed = new URL(normalizedUrl)
    const host = parsed.hostname.toLowerCase()
    const pathname = parsed.pathname

    for (const rule of platformRules) {
      if (rule.hosts.includes(host)) {
        const username = rule.extract(pathname)
        if (username) {
          return {
            platform: rule.slugs[0],
            username,
          }
        }
      }
    }

    return null
  } catch {
    return null
  }
}
