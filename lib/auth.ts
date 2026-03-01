import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { compare } from 'bcryptjs'
import type { OAuthConfig } from 'next-auth/providers/oauth'

// Custom WeChat OAuth Provider
function WeChatProvider(options: {
  clientId: string
  clientSecret: string
}): OAuthConfig<any> {
  return {
    id: 'wechat',
    name: 'WeChat',
    type: 'oauth',
    authorization: {
      url: 'https://open.weixin.qq.com/connect/qrconnect',
      params: {
        appid: options.clientId,
        scope: 'snsapi_login',
        response_type: 'code',
      },
    },
    token: {
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      async request({ params, provider }) {
        const url = new URL('https://api.weixin.qq.com/sns/oauth2/access_token')
        url.searchParams.append('appid', options.clientId)
        url.searchParams.append('secret', options.clientSecret)
        url.searchParams.append('code', params.code!)
        url.searchParams.append('grant_type', 'authorization_code')

        const response = await fetch(url.toString())
        const tokens = await response.json()
        return { tokens }
      },
    },
    userinfo: {
      url: 'https://api.weixin.qq.com/sns/userinfo',
      async request({ tokens, provider }) {
        const url = new URL('https://api.weixin.qq.com/sns/userinfo')
        url.searchParams.append('access_token', tokens.access_token as string)
        url.searchParams.append('openid', tokens.openid as string)
        url.searchParams.append('lang', 'en')

        const response = await fetch(url.toString())
        return await response.json()
      },
    },
    profile(profile) {
      return {
        id: profile.openid,
        name: profile.nickname,
        email: profile.email || `${profile.openid}@wechat.local`,
        image: profile.headimgurl,
      }
    },
    style: {
      logo: '/wechat-logo.svg',
      bg: '#07C160',
      text: '#fff',
    },
    options,
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    WeChatProvider({
      clientId: process.env.WECHAT_APP_ID || '',
      clientSecret: process.env.WECHAT_APP_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await compare(credentials.password, user.password)

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return user
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.userType = (user as any).userType
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        (session.user as any).id = `${token.sub || token.id || ''}`;
        (session.user as any).userType = token.userType
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
