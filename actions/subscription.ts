'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upgradeToPro() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Calculate subscription dates
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  // 1. Create or update subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      status: 'active',
      plan: 'pro',
      current_period_end: periodEnd.toISOString()
    })

  if (subError) {
    console.error('Error creating subscription:', subError)
    throw new Error('Transaction failed. Could not register subscription in the archives.')
  }

  // 2. Unlock all premium items on the user profile
  const { error: userError } = await supabase
    .from('users')
    .update({
      unlocked_board_skins: ['classic', 'neon-abyss', 'molten-core', 'cosmic-void'],
      unlocked_piece_skins: ['classic', 'arcane-runes', 'hologram'],
      unlocked_spell_effects: ['classic', 'solar-flare', 'glacial-spike', 'void-implosion']
    })
    .eq('id', user.id)

  if (userError) {
    console.error('Error unlocking skins:', userError)
    // Non-blocking fallback if custom arrays are not configured in schema yet
  }

  // 3. Award Archmage Initiate Achievement
  try {
    const { error: achError } = await supabase.from('achievements').insert({
      user_id: user.id,
      name: 'Archmage Initiate',
      description: 'Unlock Archmage Pro and acquire all cosmic cosmetics',
      badge_icon: 'crown',
      xp_reward: 500
    })
    
    if (!achError) {
      // Increment XP for Achievement
      await supabase.rpc('increment_xp', { user_id: user.id, amount: 500 })
    }
  } catch (err) {
    console.warn('Achievement already unlocked or trigger errored:', err)
  }

  revalidatePath('/profile')
  revalidatePath('/')
  return { success: true }
}

export async function cancelProSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      plan: 'free'
    })
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  // Lock premium cosmetics
  await supabase
    .from('users')
    .update({
      board_skin: 'classic',
      piece_skin: 'classic',
      spell_effect: 'classic',
      unlocked_board_skins: ['classic'],
      unlocked_piece_skins: ['classic'],
      unlocked_spell_effects: ['classic']
    })
    .eq('id', user.id)

  revalidatePath('/profile')
  return { success: true }
}
