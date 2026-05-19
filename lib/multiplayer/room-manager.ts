/**
 * Supabase CRUD service for game_rooms.
 * All DB operations go through this module — keeps SQL out of hooks.
 */

import { createClient } from '@/lib/supabase/client'

export interface GameRoom {
  id: string
  host_id: string | null
  guest_id: string | null
  host_color: 'white' | 'black'
  status: 'waiting' | 'active' | 'finished' | 'abandoned'
  fen: string
  pgn_history: string[]
  move_seq: number
  time_white: number
  time_black: number
  time_control: number
  winner: string | null
  created_at: string
  updated_at: string
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

/** Generates a URL-safe 8-character room ID without external deps */
function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let id = ''
  const array = new Uint8Array(8)
  crypto.getRandomValues(array)
  for (const byte of array) {
    id += chars[byte % chars.length]
  }
  return id
}

/** Creates a new room and returns the room ID */
export async function createRoom(
  hostId: string,
  timeControl: number = 600
): Promise<{ roomId: string; error: string | null }> {
  const supabase = createClient()
  const roomId = generateRoomId()

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
    console.error('[RoomManager] createRoom error:', error)
    return { roomId: '', error: error.message }
  }

  // Persist last room for reconnection
  localStorage.setItem('chess_last_room', roomId)

  return { roomId, error: null }
}

/** Joins an existing room as the guest */
export async function joinRoom(
  roomId: string,
  guestId: string
): Promise<{ room: GameRoom | null; error: string | null }> {
  const supabase = createClient()

  const { data: room, error: fetchError } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (fetchError || !room) {
    return { room: null, error: fetchError?.message ?? 'Room not found' }
  }

  if (room.status !== 'waiting') {
    return { room: null, error: 'Room is no longer available' }
  }

  if (room.host_id === guestId) {
    return { room: null, error: 'Cannot join your own room' }
  }

  const { data: updatedRoom, error: updateError } = await supabase
    .from('game_rooms')
    .update({ guest_id: guestId, status: 'active' })
    .eq('id', roomId)
    .select('*')
    .single()

  if (updateError || !updatedRoom) {
    return { room: null, error: updateError?.message ?? 'Failed to join room' }
  }

  // Persist last room for reconnection
  localStorage.setItem('chess_last_room', roomId)

  return { room: updatedRoom as GameRoom, error: null }
}

/** Fetches the current room state (used for reconnection) */
export async function getRoom(roomId: string): Promise<GameRoom | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error || !data) return null
  return data as GameRoom
}

/** Persists authoritative state after each move */
export async function updateRoomState(
  roomId: string,
  updates: {
    fen: string
    pgn_history: string[]
    move_seq: number
    time_white: number
    time_black: number
    status?: GameRoom['status']
    winner?: string | null
  }
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('game_rooms')
    .update(updates)
    .eq('id', roomId)

  if (error) {
    console.error('[RoomManager] updateRoomState error:', error)
  }
}

/** Marks a room as abandoned */
export async function abandonRoom(roomId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('game_rooms')
    .update({ status: 'abandoned' })
    .eq('id', roomId)
}

/** Matchmaking queue operations */
export async function enterMatchmakingQueue(
  userId: string,
  timeControl: number
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('matchmaking_queue')
    .upsert({ user_id: userId, time_control: timeControl }, { onConflict: 'user_id' })
}

export async function leaveMatchmakingQueue(userId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('matchmaking_queue').delete().eq('user_id', userId)
}

export async function findMatchmakingOpponent(
  userId: string,
  timeControl: number
): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('matchmaking_queue')
    .select('user_id')
    .eq('time_control', timeControl)
    .neq('user_id', userId)
    .order('entered_at', { ascending: true })
    .limit(1)
    .single()

  return data?.user_id ?? null
}

/** Fetches username by user ID */
export async function getUsername(userId: string): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return `Mage#${userId.slice(0, 4)}`
  }
  return data.username
}
