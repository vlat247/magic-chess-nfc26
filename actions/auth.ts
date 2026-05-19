'use strict'

'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithEmail(formData: { email: string; password: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/profile')
}

export async function signUpWithEmail(formData: { email: string; username: string; password: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        user_name: formData.username,
        is_guest: false,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${formData.username}`,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.session) {
    redirect('/profile')
  }

  return { emailVerificationRequired: true }
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
