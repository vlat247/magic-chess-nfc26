'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  profile: any | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  profile: null,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Failed to fetch profile', err)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    // Eager synchronous session hydration from localStorage to bypass any network/Supabase delay
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (url) {
        const projectId = url.split('//')[1]?.split('.')[0]
        if (projectId) {
          const storageKey = `sb-${projectId}-auth-token`
          const localData = localStorage.getItem(storageKey)
          if (localData) {
            const parsed = JSON.parse(localData)
            if (parsed && parsed.user) {
              setSession(parsed)
              setUser(parsed.user)
              if (parsed.user.user_metadata?.profile) {
                setProfile(parsed.user.user_metadata.profile)
              }
              setIsLoading(false)
              fetchProfile(parsed.user.id)
            }
          }
        }
      }
    } catch (e) {
      console.debug('[AuthProvider] Eager hydration skipped:', e)
    }

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // If we have an eager session and onAuthStateChange fires with INITIAL_SESSION and null,
        // ignore it to prevent wiping out our eager session and causing a 20-second delay.
        if (event === 'INITIAL_SESSION' && !currentSession) {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL
          const projectId = url?.split('//')[1]?.split('.')[0]
          const storageKey = `sb-${projectId}-auth-token`
          if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
            // Eager token exists, ignore this initial null event
            return
          }
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id)
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, isLoading, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
