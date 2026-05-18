'use strict'

'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginWithProvider(provider: 'google' | 'github') {
  const supabase = await createClient()
  
  // We determine the origin based on env or default to localhost
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function loginAsGuest() {
  const supabase = await createClient()

  // Generate random username for the guest
  const randomId = Math.random().toString(36).substring(2, 8)
  const username = `Guest_${randomId}`

  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        user_name: username,
        is_guest: true,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/profile')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
