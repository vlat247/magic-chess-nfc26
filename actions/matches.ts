'use strict'

'use server'

import { createClient } from '@/lib/supabase/server'

interface SaveMatchParams {
  opponentName: string | null
  pgn: string
  winner: 'white' | 'black' | 'draw'
  mode: 'pvp' | 'ai'
}

export async function saveMatch({ opponentName, pgn, winner, mode }: SaveMatchParams) {
  const supabase = await createClient()

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // 1. Save match record
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      user_id: user.id,
      opponent_name: opponentName,
      pgn,
      winner,
      mode,
      status: 'completed',
    })
    .select()
    .single()

  if (matchError) {
    throw new Error(`Failed to save match: ${matchError.message}`)
  }

  // 2. Fetch current profile stats to update them
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('wins, losses, draws, games_played, rating')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch user profile: ${profileError.message}`)
  }

  // Simple Elo calculation parameters
  let ratingChange = 0
  let isWin = false
  let isLoss = false
  let isDraw = false

  // For simplicity, let's assume user is always White in single player AI mode
  // and wins if winner is 'white'
  if (winner === 'draw') {
    isDraw = true
    ratingChange = 0
  } else if (winner === 'white') {
    isWin = true
    ratingChange = 16
  } else {
    isLoss = true
    ratingChange = -16
  }

  const newWins = profile.wins + (isWin ? 1 : 0)
  const newLosses = profile.losses + (isLoss ? 1 : 0)
  const newDraws = profile.draws + (isDraw ? 1 : 0)
  const newGamesPlayed = profile.games_played + 1
  const newRating = Math.max(100, profile.rating + ratingChange)

  // 3. Update profile statistics
  const { error: updateError } = await supabase
    .from('users')
    .update({
      wins: newWins,
      losses: newLosses,
      draws: newDraws,
      games_played: newGamesPlayed,
      rating: newRating,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update user profile stats: ${updateError.message}`)
  }

  return {
    match,
    newRating,
    ratingChange,
  }
}
