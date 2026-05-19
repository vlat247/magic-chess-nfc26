/**
 * Typed Supabase Realtime channel factory.
 * Every room gets its own isolated channel: `room:{roomId}`
 *
 * Broadcast event types are fully typed to prevent illegal message shapes.
 */

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ── Broadcast Message Types ──────────────────────────────────────────────────

export interface MoveBroadcast {
  type: 'MOVE'
  from: string
  to: string
  promotion?: string
  fen: string              // resulting FEN (for fast reconciliation)
  san: string              // SAN notation
  seq: number              // monotonic move counter
  timeWhite: number        // remaining seconds
  timeBlack: number
}

export interface TimerSyncBroadcast {
  type: 'TIMER_SYNC'
  timeWhite: number
  timeBlack: number
  seq: number
}

export interface PlayerJoinBroadcast {
  type: 'PLAYER_JOIN'
  userId: string
  username: string
  color: 'white' | 'black'
}

export interface PlayerLeaveBroadcast {
  type: 'PLAYER_LEAVE'
  userId: string
}

export interface PlayerRejoinBroadcast {
  type: 'PLAYER_REJOIN'
  userId: string
}

export interface GameOverBroadcast {
  type: 'GAME_OVER'
  winner: 'white' | 'black' | 'draw'
  reason: 'checkmate' | 'stalemate' | 'draw' | 'timeout' | 'resign' | 'abandon'
}

export interface SyncRequestBroadcast {
  type: 'SYNC_REQUEST'
  fromSeq: number
}

export interface SyncResponseBroadcast {
  type: 'SYNC_RESPONSE'
  fen: string
  pgn_history: string[]
  seq: number
  timeWhite: number
  timeBlack: number
}

export type RoomBroadcast =
  | MoveBroadcast
  | TimerSyncBroadcast
  | PlayerJoinBroadcast
  | PlayerLeaveBroadcast
  | PlayerRejoinBroadcast
  | GameOverBroadcast
  | SyncRequestBroadcast
  | SyncResponseBroadcast

// ── Channel Factory ───────────────────────────────────────────────────────────

export interface RoomChannelCallbacks {
  onMove?: (payload: MoveBroadcast) => void
  onTimerSync?: (payload: TimerSyncBroadcast) => void
  onPlayerJoin?: (payload: PlayerJoinBroadcast) => void
  onPlayerLeave?: (payload: PlayerLeaveBroadcast) => void
  onPlayerRejoin?: (payload: PlayerRejoinBroadcast) => void
  onGameOver?: (payload: GameOverBroadcast) => void
  onSyncRequest?: (payload: SyncRequestBroadcast) => void
  onSyncResponse?: (payload: SyncResponseBroadcast) => void
  onPresenceJoin?: (state: Record<string, unknown[]>) => void
  onPresenceLeave?: (state: Record<string, unknown[]>) => void
}

export interface RoomChannel {
  channel: RealtimeChannel
  broadcast: (event: RoomBroadcast) => Promise<void>
  trackPresence: (userId: string, username: string) => Promise<void>
  unsubscribe: () => void
}

/** Creates a typed, scoped Realtime channel for a specific room */
export function createRoomChannel(
  roomId: string,
  callbacks: RoomChannelCallbacks
): RoomChannel {
  const supabase = createClient()
  const channelName = `room:${roomId}`

  const channel = supabase.channel(channelName, {
    config: { broadcast: { self: false }, presence: { key: '' } },
  })

  // Register broadcast listeners
  channel.on('broadcast', { event: 'MOVE' }, ({ payload }) => {
    callbacks.onMove?.(payload as MoveBroadcast)
  })

  channel.on('broadcast', { event: 'TIMER_SYNC' }, ({ payload }) => {
    callbacks.onTimerSync?.(payload as TimerSyncBroadcast)
  })

  channel.on('broadcast', { event: 'PLAYER_JOIN' }, ({ payload }) => {
    callbacks.onPlayerJoin?.(payload as PlayerJoinBroadcast)
  })

  channel.on('broadcast', { event: 'PLAYER_LEAVE' }, ({ payload }) => {
    callbacks.onPlayerLeave?.(payload as PlayerLeaveBroadcast)
  })

  channel.on('broadcast', { event: 'PLAYER_REJOIN' }, ({ payload }) => {
    callbacks.onPlayerRejoin?.(payload as PlayerRejoinBroadcast)
  })

  channel.on('broadcast', { event: 'GAME_OVER' }, ({ payload }) => {
    callbacks.onGameOver?.(payload as GameOverBroadcast)
  })

  channel.on('broadcast', { event: 'SYNC_REQUEST' }, ({ payload }) => {
    callbacks.onSyncRequest?.(payload as SyncRequestBroadcast)
  })

  channel.on('broadcast', { event: 'SYNC_RESPONSE' }, ({ payload }) => {
    callbacks.onSyncResponse?.(payload as SyncResponseBroadcast)
  })

  // Presence (online/offline detection)
  channel.on('presence', { event: 'join' }, ({ newPresences }) => {
    callbacks.onPresenceJoin?.(newPresences as unknown as Record<string, unknown[]>)
  })

  channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
    callbacks.onPresenceLeave?.(leftPresences as unknown as Record<string, unknown[]>)
  })

  channel.subscribe()

  async function broadcast(event: RoomBroadcast): Promise<void> {
    await channel.send({
      type: 'broadcast',
      event: event.type,
      payload: event,
    })
  }

  async function trackPresence(userId: string, username: string): Promise<void> {
    await channel.track({ userId, username, onlineAt: Date.now() })
  }

  function unsubscribe(): void {
    supabase.removeChannel(channel)
  }

  return { channel, broadcast, trackPresence, unsubscribe }
}
