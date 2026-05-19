'use client'

/**
 * use-multiplayer-room — primary orchestration hook.
 *
 * Responsibilities:
 *  1. Create / join rooms via room-manager
 *  2. Subscribe to Realtime channel
 *  3. Validate and apply incoming moves via move-validator
 *  4. Handle reconnection (localStorage → DB → Realtime resubscribe)
 *  5. Detect opponent disconnect via Presence
 *  6. Broadcast our own moves
 *  7. Coordinate timers via use-room-timer
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMultiplayerStore, PlayerColor } from '@/store/multiplayer-store'
import { createRoomChannel, RoomChannel } from '@/lib/multiplayer/realtime-channel'
import {
  getRoom,
  updateRoomState,
  abandonRoom,
  getUsername,
  GameRoom,
} from '@/lib/multiplayer/room-manager'
import { createRoomAction, joinRoomAction } from '@/actions/room'
import {
  validateAndApplyMove,
  reconstructFromHistory,
  isPlayersTurn,
  isGameOver,
} from '@/lib/multiplayer/move-validator'
import { useRoomTimer } from './use-room-timer'

const DISCONNECT_TIMEOUT_SECONDS = 30

export interface UseMultiplayerRoomReturn {
  // Actions
  createAndEnterRoom: (hostUserId: string, hostUsername: string, timeControl?: number) => Promise<string | null>
  joinExistingRoom: (roomId: string, guestUserId: string, guestUsername: string) => Promise<boolean>
  makeMultiplayerMove: (from: string, to: string, promotion?: string) => boolean
  resignGame: () => void
  leaveRoom: () => void

  // Derived state
  isMyTurn: boolean
  disconnectCountdown: number | null

  // Channel (exposed for timer hook)
  roomChannel: RoomChannel | null
}

export function useMultiplayerRoom(
  currentUserId: string | null,
  currentUsername: string
): UseMultiplayerRoomReturn {
  const router = useRouter()
  const roomChannelRef = useRef<RoomChannel | null>(null)
  const disconnectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [disconnectCountdown, setDisconnectCountdown] = useState<number | null>(null)

  const {
    roomId,
    playerColor,
    fen,
    pgnHistory,
    moveSeq,
    timeWhite,
    timeBlack,
    gamePhase,
    opponentStatus,
    setRoom,
    setPlayerColor,
    setOpponent,
    setConnectionStatus,
    setOpponentStatus,
    applyMove,
    setTimers,
    setGamePhase,
    setLoading,
    setError,
    hydrateFromRoom,
    resetRoom,
  } = useMultiplayerStore()

  // Derived
  const isMyTurn = playerColor
    ? isPlayersTurn(fen, playerColor)
    : false

  // Timer hook
  const { handleTimerSync } = useRoomTimer({
    roomChannel: roomChannelRef.current,
    active: gamePhase === 'active',
  })

  /** Tears down an existing channel subscription */
  const teardownChannel = useCallback(() => {
    if (roomChannelRef.current) {
      roomChannelRef.current.unsubscribe()
      roomChannelRef.current = null
    }
    if (disconnectTimerRef.current) {
      clearInterval(disconnectTimerRef.current)
      disconnectTimerRef.current = null
    }
  }, [])

  /** Builds and subscribes to the Realtime channel for a given room */
  const subscribeToRoom = useCallback(
    (rId: string, myColor: PlayerColor, myUserId: string, myUsername: string, room: GameRoom) => {
      teardownChannel()

      const channel = createRoomChannel(rId, {
        // ── Incoming move ─────────────────────────────────────────────────────
        onMove: (payload) => {
          // Ignore our own echoed moves (self: false set on channel, but guard anyway)
          if (!currentUserId) return

          // Sequence guard — ignore replayed/old messages
          const currentSeq = useMultiplayerStore.getState().moveSeq
          if (payload.seq <= currentSeq) return

          // Re-validate with chess.js — NEVER trust FEN from broadcast alone
          const currentFen = useMultiplayerStore.getState().fen
          const validated = validateAndApplyMove(currentFen, payload.from, payload.to, payload.promotion)

          if (!validated.valid) {
            // Desync detected — request full state sync
            channel.broadcast({ type: 'SYNC_REQUEST', fromSeq: currentSeq })
            return
          }

          applyMove({
            fen: validated.newFen,
            san: validated.san,
            seq: payload.seq,
            isCheck: validated.isCheck,
            isCheckmate: validated.isCheckmate,
            isStalemate: validated.isStalemate,
            isDraw: validated.isDraw,
            winner: validated.winner,
            turn: validated.turn,
          })

          setTimers(payload.timeWhite, payload.timeBlack)
        },

        // ── Timer sync ────────────────────────────────────────────────────────
        onTimerSync: (payload) => {
          handleTimerSync(payload.timeWhite, payload.timeBlack)
        },

        // ── Opponent joined ───────────────────────────────────────────────────
        onPlayerJoin: (payload) => {
          setOpponent(payload.userId, payload.username)
          setOpponentStatus('online')
          setGamePhase('active')
        },

        // ── Opponent left ─────────────────────────────────────────────────────
        onPlayerLeave: (payload) => {
          if (payload.userId === currentUserId) return
          setOpponentStatus('offline')
          startDisconnectCountdown(rId)
        },

        // ── Opponent rejoined ─────────────────────────────────────────────────
        onPlayerRejoin: (payload) => {
          if (payload.userId === currentUserId) return
          setOpponentStatus('online')
          clearDisconnectCountdown()

          // Send them a full state sync
          const state = useMultiplayerStore.getState()
          channel.broadcast({
            type: 'SYNC_RESPONSE',
            fen: state.fen,
            pgn_history: state.pgnHistory,
            seq: state.moveSeq,
            timeWhite: state.timeWhite,
            timeBlack: state.timeBlack,
          })
        },

        // ── Full state sync ───────────────────────────────────────────────────
        onSyncRequest: () => {
          const state = useMultiplayerStore.getState()
          channel.broadcast({
            type: 'SYNC_RESPONSE',
            fen: state.fen,
            pgn_history: state.pgnHistory,
            seq: state.moveSeq,
            timeWhite: state.timeWhite,
            timeBlack: state.timeBlack,
          })
        },

        onSyncResponse: (payload) => {
          const rebuilt = reconstructFromHistory(payload.pgn_history)
          hydrateFromRoom({
            fen: rebuilt.fen,
            pgnHistory: payload.pgn_history,
            moveSeq: payload.seq,
            turn: rebuilt.turn,
            timeWhite: payload.timeWhite,
            timeBlack: payload.timeBlack,
            timeControl: room.time_control,
            isCheckmate: rebuilt.isCheckmate,
            isStalemate: rebuilt.isStalemate,
            isDraw: rebuilt.isDraw,
          })
        },

        // ── Game over from opponent ───────────────────────────────────────────
        onGameOver: (payload) => {
          useMultiplayerStore.setState({
            winner: payload.winner,
            gamePhase: 'finished',
          })
        },

        // ── Presence (online/offline) ─────────────────────────────────────────
        onPresenceJoin: () => {
          setOpponentStatus('online')
          clearDisconnectCountdown()
        },

        onPresenceLeave: () => {
          const state = useMultiplayerStore.getState()
          if (state.gamePhase === 'active') {
            setOpponentStatus('offline')
            startDisconnectCountdown(rId)
          }
        },
      })

      // Track our own presence
      channel.trackPresence(myUserId, myUsername)
      roomChannelRef.current = channel
      setConnectionStatus('connected')

      // Announce join
      channel.broadcast({
        type: 'PLAYER_JOIN',
        userId: myUserId,
        username: myUsername,
        color: myColor,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId, applyMove, setTimers, setOpponent, setOpponentStatus, setGamePhase, setConnectionStatus, handleTimerSync, hydrateFromRoom, teardownChannel]
  )

  /** Starts the 30s disconnect countdown */
  function startDisconnectCountdown(rId: string) {
    if (disconnectTimerRef.current) return // already running
    let countdown = DISCONNECT_TIMEOUT_SECONDS
    setDisconnectCountdown(countdown)

    disconnectTimerRef.current = setInterval(() => {
      countdown -= 1
      setDisconnectCountdown(countdown)

      if (countdown <= 0) {
        clearDisconnectCountdown()
        // Opponent abandoned — game over, current player wins
        const state = useMultiplayerStore.getState()
        const myColor = state.playerColor
        const winner = myColor ?? 'draw'
        useMultiplayerStore.setState({ gamePhase: 'finished', winner })
        abandonRoom(rId)
      }
    }, 1000)
  }

  function clearDisconnectCountdown() {
    if (disconnectTimerRef.current) {
      clearInterval(disconnectTimerRef.current)
      disconnectTimerRef.current = null
    }
    setDisconnectCountdown(null)
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Creates a new room and subscribes. Returns the roomId. */
  const createAndEnterRoom = useCallback(
    async (hostUserId: string, hostUsername: string, timeControl = 600): Promise<string | null> => {
      if (!hostUserId) return null
      setLoading(true)
      setError(null)

      try {
        const { roomId: newRoomId, error } = await createRoomAction(hostUserId, timeControl)
        if (error || !newRoomId) {
          setError(error ?? 'Failed to create room')
          return null
        }

        const room = await getRoom(newRoomId)
        if (!room) {
          setError('Failed to load room')
          return null
        }

        setRoom(newRoomId)
        setPlayerColor('white')
        setGamePhase('waiting')

        hydrateFromRoom({
          fen: room.fen,
          pgnHistory: room.pgn_history,
          moveSeq: room.move_seq,
          turn: 'w',
          timeWhite: room.time_white,
          timeBlack: room.time_black,
          timeControl: room.time_control,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
        })

        subscribeToRoom(newRoomId, 'white', hostUserId, hostUsername, room)
        return newRoomId
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, setRoom, setPlayerColor, setGamePhase, hydrateFromRoom, subscribeToRoom]
  )

  /** Joins an existing room by ID */
  const joinExistingRoom = useCallback(
    async (rId: string, guestUserId: string, guestUsername: string): Promise<boolean> => {
      if (!guestUserId) return false
      setLoading(true)
      setError(null)

      try {
        // First check if we're reconnecting
        const room = await getRoom(rId)
        if (!room) {
          setError('Room not found')
          return false
        }

        const isReconnect = room.host_id === guestUserId || room.guest_id === guestUserId

        if (!isReconnect) {
          // Fresh join as guest
          const { error } = await joinRoomAction(rId, guestUserId)
          if (error) {
            setError(error)
            return false
          }
        }

        // Determine color
        const color: PlayerColor = room.host_id === guestUserId ? 'white' : 'black'
        const freshRoom = await getRoom(rId)
        if (!freshRoom) return false

        // Rebuild state from history (anti-desync)
        const rebuilt = reconstructFromHistory(freshRoom.pgn_history)

        setRoom(rId)
        setPlayerColor(color)
        setGamePhase(freshRoom.status === 'active' ? 'active' : 'waiting')

        hydrateFromRoom({
          fen: rebuilt.fen,
          pgnHistory: freshRoom.pgn_history,
          moveSeq: freshRoom.move_seq,
          turn: rebuilt.turn,
          timeWhite: freshRoom.time_white,
          timeBlack: freshRoom.time_black,
          timeControl: freshRoom.time_control,
          isCheckmate: rebuilt.isCheckmate,
          isStalemate: rebuilt.isStalemate,
          isDraw: rebuilt.isDraw,
        })

        // Fetch and set opponent details if they are in the room
        const oppId = color === 'white' ? freshRoom.guest_id : freshRoom.host_id
        if (oppId) {
          const oppUsername = await getUsername(oppId)
          setOpponent(oppId, oppUsername)
          setOpponentStatus('online')
        }

        subscribeToRoom(rId, color, guestUserId, guestUsername, freshRoom)

        // Signal rejoin to host
        if (isReconnect) {
          roomChannelRef.current?.broadcast({
            type: 'PLAYER_REJOIN',
            userId: guestUserId,
          })
        }

        return true
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, setRoom, setPlayerColor, setGamePhase, hydrateFromRoom, subscribeToRoom]
  )

  /** Makes a move — validates locally first, then broadcasts */
  const makeMultiplayerMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!playerColor || !roomId || !currentUserId) return false
      if (!isMyTurn) return false
      if (gamePhase !== 'active') return false

      // Local validation first
      const validated = validateAndApplyMove(fen, from, to, promotion)
      if (!validated.valid) return false

      const newSeq = moveSeq + 1

      // Apply locally (optimistic update)
      applyMove({
        fen: validated.newFen,
        san: validated.san,
        seq: newSeq,
        isCheck: validated.isCheck,
        isCheckmate: validated.isCheckmate,
        isStalemate: validated.isStalemate,
        isDraw: validated.isDraw,
        winner: validated.winner,
        turn: validated.turn,
      })

      // Broadcast to opponent
      const state = useMultiplayerStore.getState()
      roomChannelRef.current?.broadcast({
        type: 'MOVE',
        from,
        to,
        promotion,
        fen: validated.newFen,
        san: validated.san,
        seq: newSeq,
        timeWhite: state.timeWhite,
        timeBlack: state.timeBlack,
      })

      // Persist authoritative state to DB
      const gameOver = isGameOver(validated.newFen)
      updateRoomState(roomId, {
        fen: validated.newFen,
        pgn_history: state.pgnHistory,
        move_seq: newSeq,
        time_white: state.timeWhite,
        time_black: state.timeBlack,
        ...(gameOver.over && {
          status: 'finished',
          winner: gameOver.winner ?? undefined,
        }),
      })

      return true
    },
    [playerColor, roomId, currentUserId, isMyTurn, gamePhase, fen, moveSeq, applyMove]
  )

  /** Resign the game */
  const resignGame = useCallback(() => {
    if (!playerColor || !roomId) return
    const winner = playerColor === 'white' ? 'black' : 'white'

    useMultiplayerStore.setState({ gamePhase: 'finished', winner })

    roomChannelRef.current?.broadcast({
      type: 'GAME_OVER',
      winner,
      reason: 'resign',
    })

    updateRoomState(roomId, {
      fen,
      pgn_history: pgnHistory,
      move_seq: moveSeq,
      time_white: timeWhite,
      time_black: timeBlack,
      status: 'finished',
      winner,
    })
  }, [playerColor, roomId, fen, pgnHistory, moveSeq, timeWhite, timeBlack])

  /** Leave the room (without resigning — for non-started games) */
  const leaveRoom = useCallback(() => {
    if (roomId && currentUserId) {
      roomChannelRef.current?.broadcast({
        type: 'PLAYER_LEAVE',
        userId: currentUserId,
      })

      if (gamePhase === 'waiting') {
        abandonRoom(roomId)
      }
    }

    teardownChannel()
    localStorage.removeItem('chess_last_room')
    resetRoom()
    router.push('/profile')
  }, [roomId, currentUserId, gamePhase, teardownChannel, resetRoom, router])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      teardownChannel()
    }
  }, [teardownChannel])

  return {
    createAndEnterRoom,
    joinExistingRoom,
    makeMultiplayerMove,
    resignGame,
    leaveRoom,
    isMyTurn,
    disconnectCountdown,
    roomChannel: roomChannelRef.current,
  }
}
