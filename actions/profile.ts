'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSummonerProfile(username: string, city: string | null) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be summoned to customize your profile.')
  }

  // Basic validation
  if (!username || username.trim().length < 3) {
    throw new Error('Summoner name must be at least 3 characters long.')
  }

  const { error } = await supabase
    .from('users')
    .update({
      username: username.trim(),
      city: city ? city.trim() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error(error.message || 'Failed to update profile.')
  }

  revalidatePath('/profile')
  revalidatePath('/leaderboard')
  return { success: true }
}
