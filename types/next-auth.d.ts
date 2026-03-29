import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userType: string
      subscriptionTier: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/react" {
  export function useSession<R extends boolean = false>(options?: {
    required?: R
    onUnauthenticated?: () => void
  }): {
    data: import("next-auth").Session | null
    status: "authenticated" | "unauthenticated" | "loading"
    update: (data?: any) => Promise<import("next-auth").Session | null>
  }
  export function signIn(
    provider?: string,
    options?: Record<string, any>,
    authorizationParams?: Record<string, string>
  ): Promise<any>
  export function signOut(options?: Record<string, any>): Promise<any>
  export function getSession(params?: any): Promise<import("next-auth").Session | null>
  export function getCsrfToken(params?: any): Promise<string | undefined>
  export function getProviders(): Promise<Record<string, any> | null>
  export function SessionProvider(props: {
    children: React.ReactNode
    session?: import("next-auth").Session | null
    refetchInterval?: number
    refetchOnWindowFocus?: boolean
    refetchWhenOffline?: false
  }): JSX.Element
}
