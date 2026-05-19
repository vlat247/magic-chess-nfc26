'use server'

/**
 * Server Actions for game room operations.
 * Bypasses client-side RLS and env var bundle quirks by executing entirely on the server.
 */

import { createClient } from '@/lib/supabase/server'

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

/** Generates a URL-safe 8-character room ID */
function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let id = ''
  // Use crypto on the server
  const array = new Uint8Array(8)
  require('crypto').randomFillSync(array)
  for (const byte of array) {
    id += chars[byte % chars.length]
  }
  return id
}

export async function createRoomAction(
  hostId: string,
  timeControl: number = 600
): Promise<{ roomId: string; error: string | null }> {
  try {
    const supabase = await createClient()
    const roomId = generateRoomId()

    console.log('[createRoomAction] Attempting to insert room:', roomId, 'for host:', hostId)

    const { error } = await supabase.from('game_rooms').insert({
      id: roomId,
      host_id: hostId,
      host_color: 'white',
      status: 'waiting',
      fen: INITIAL_FEN,
      pgn_history: [],
      move_seq: 0,
      time_white: timeControl,
      time_black: timeControl,
      time_control: timeControl,
    })

    if (error) {
      console.error('[createRoomAction] DB Error:', error)
      return { roomId: '', error: error.message }
    }

    console.log('[createRoomAction] Room created successfully:', roomId)
    return { roomId, error: null }
  } catch (err: any) {
    console.error('[createRoomAction] Unexpected Exception:', err)
    return { roomId: '', error: err?.message ?? 'Unknown server error' }
  }
}

export async function joinRoomAction(
  roomId: string,
  guestId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    console.log('[joinRoomAction] Guest trying to join room:', roomId, 'guestId:', guestId)

    const { data: room, error: fetchError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (fetchError || !room) {
      console.error('[joinRoomAction] Fetch Error:', fetchError)
      return { error: fetchError?.message ?? 'Room not found' }
    }

    if (room.status !== 'waiting') {
      return { error: 'Room is no longer available' }
    }

    if (room.host_id === guestId) {
      return { error: 'Cannot join your own room' }
    }

    const { error: updateError } = await supabase
      .from('game_rooms')
      .update({ guest_id: guestId, status: 'active' })
      .eq('id', roomId)

    if (updateError) {
      console.error('[joinRoomAction] Update Error:', updateError)
      return { error: updateError.message }
    }

    console.log('[joinRoomAction] Guest joined successfully:', roomId)
    return { error: null }
  } catch (err: any) {
    console.error('[joinRoomAction] Unexpected Exception:', err)
    return { error: err?.message ?? 'Unknown server error' }
  }
}
