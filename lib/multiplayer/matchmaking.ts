/**
 * Queue-based matchmaking service.
 * Uses Supabase Realtime to watch the matchmaking_queue table
 * and automatically pairs two players with the same time control.
 */

import { createClient } from '@/lib/supabase/client'
import { createRoom, joinRoom, leaveMatchmakingQueue, enterMatchmakingQueue, findMatchmakingOpponent } from './room-manager'

interface MatchFoundCallback {
  (roomId: string, playerColor: 'white' | 'black'): void
}

interface MatchmakingHandle {
  cancel: () => Promise<void>
}

/**
 * Enters the matchmaking queue and subscribes to pairings.
 * Calls `onMatchFound` when a game is ready.
 */
export async function startMatchmaking(
  userId: string,
  username: string,
  timeControl: number,
  onMatchFound: MatchFoundCallback,
  onError: (msg: string) => void
): Promise<MatchmakingHandle> {
  const supabase = createClient()

  // First try to find an existing opponent in the queue
  const opponentId = await findMatchmakingOpponent(userId, timeControl)

  if (opponentId) {
    // We found someone — we join their implicit pairing as guest
    // Remove opponent from queue, create room, join it
    await leaveMatchmakingQueue(opponentId)
    const { roomId, error } = await createRoom(userId, timeControl)

    if (error || !roomId) {
      onError(error ?? 'Failed to create room')
      return { cancel: async () => {} }
    }

    // Notify via Realtime that this opponent is matched
    const notifyChannel = supabase.channel(`match:${opponentId}`)
    notifyChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await notifyChannel.send({
          type: 'broadcast',
          event: 'MATCH_FOUND',
          payload: { roomId, yourColor: 'black' },
        })
        supabase.removeChannel(notifyChannel)
      }
    })

    onMatchFound(roomId, 'white')
    return { cancel: async () => {} }
  }

  // No opponent yet — enter queue and listen for a match on personal channel
  await enterMatchmakingQueue(userId, timeControl)

  const personalChannel = supabase.channel(`match:${userId}`)

  personalChannel.on('broadcast', { event: 'MATCH_FOUND' }, async ({ payload }) => {
    const { roomId, yourColor } = payload as { roomId: string; yourColor: 'white' | 'black' }

    // Join the room as guest
    const { error } = await joinRoom(roomId, userId)
    if (error) {
      onError(error)
      return
    }

    supabase.removeChannel(personalChannel)
    onMatchFound(roomId, yourColor)
  })

  personalChannel.subscribe()

  const cancel = async () => {
    await leaveMatchmakingQueue(userId)
    supabase.removeChannel(personalChannel)
  }

  return { cancel }
}
