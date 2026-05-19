'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function equipCosmetic(type: 'board' | 'piece' | 'spell', skinId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Load user profile & check unlocking
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: subscription } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()

  const isPro = subscription?.status === 'active' || subscription?.plan === 'pro'
  
  // Define premium skin categories
  const premiumSkins = [
    'neon-abyss', 'molten-core', 'cosmic-void', // Boards
    'arcane-runes', 'hologram',                 // Pieces
    'solar-flare', 'glacial-spike', 'void-implosion' // Spells
  ]
  
  const isPremium = premiumSkins.includes(skinId)
  
  if (isPremium && !isPro) {
    throw new Error('This cosmetic is locked inside the spellbook. Upgrade to Archmage Pro to unlock all features.')
  }

  const updateField = type === 'board' ? 'board_skin' : type === 'piece' ? 'piece_skin' : 'spell_effect'
  
  const { error } = await supabase
    .from('users')
    .update({ [updateField]: skinId })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to equip cosmetic:', error)
    throw new Error(error.message || 'Failed to equip cosmetic')
  }

  revalidatePath('/profile')
  return { success: true }
}
