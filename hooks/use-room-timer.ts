'use client'

/**
 * use-room-timer — synchronized chess clock hook.
 *
 * Runs client-side intervals and reconciles against TIMER_SYNC broadcasts
 * from the opponent. Emits TIMER_SYNC every 5 seconds when it's your turn.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useMultiplayerStore } from '@/store/multiplayer-store'
import type { RoomChannel } from '@/lib/multiplayer/realtime-channel'

const SYNC_INTERVAL_MS = 5000
const DRIFT_THRESHOLD_SECONDS = 2

interface UseRoomTimerProps {
  roomChannel: RoomChannel | null
  active: boolean // only tick when game is active
}

export function useRoomTimer({ roomChannel, active }: UseRoomTimerProps) {
  const playerColor = useMultiplayerStore((s) => s.playerColor)
  const turn = useMultiplayerStore((s) => s.turn)
  const gamePhase = useMultiplayerStore((s) => s.gamePhase)
  const setTimers = useMultiplayerStore((s) => s.setTimers)
  const setGamePhase = useMultiplayerStore((s) => s.setGamePhase)
  const timeWhite = useMultiplayerStore((s) => s.timeWhite)
  const timeBlack = useMultiplayerStore((s) => s.timeBlack)
  const moveSeq = useMultiplayerStore((s) => s.moveSeq)

  // Refs to avoid stale closure in interval
  const timeWhiteRef = useRef(timeWhite)
  const timeBlackRef = useRef(timeBlack)
  const lastSyncRef = useRef<number>(Date.now())

  useEffect(() => {
    timeWhiteRef.current = timeWhite
    timeBlackRef.current = timeBlack
  }, [timeWhite, timeBlack])

  // Emit TIMER_SYNC broadcast every 5s (only when it's our turn)
  const emitSync = useCallback(() => {
    if (!roomChannel || !playerColor) return
    const isMyTurn = (playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b')
    if (!isMyTurn) return

    roomChannel.broadcast({
      type: 'TIMER_SYNC',
      timeWhite: timeWhiteRef.current,
      timeBlack: timeBlackRef.current,
      seq: moveSeq,
    })
  }, [roomChannel, playerColor, turn, moveSeq])

  // Main 1-second clock tick
  useEffect(() => {
    if (!active || gamePhase !== 'active') return

    const interval = setInterval(() => {
      const isWhiteTurn = turn === 'w'
      const isBlackTurn = turn === 'b'

      let newWhite = timeWhiteRef.current
      let newBlack = timeBlackRef.current

      if (isWhiteTurn && newWhite > 0) {
        newWhite = Math.max(0, newWhite - 1)
      } else if (isBlackTurn && newBlack > 0) {
        newBlack = Math.max(0, newBlack - 1)
      }

      timeWhiteRef.current = newWhite
      timeBlackRef.current = newBlack
      setTimers(newWhite, newBlack)

      // Clock hit zero — emit game over via timeout
      if ((isWhiteTurn && newWhite === 0) || (isBlackTurn && newBlack === 0)) {
        const loser = isWhiteTurn ? 'white' : 'black'
        const winner = loser === 'white' ? 'black' : 'white'
        setGamePhase('finished')
        roomChannel?.broadcast({
          type: 'GAME_OVER',
          winner,
          reason: 'timeout',
        })
        clearInterval(interval)
      }

      // Emit TIMER_SYNC every 5s
      if (Date.now() - lastSyncRef.current >= SYNC_INTERVAL_MS) {
        lastSyncRef.current = Date.now()
        emitSync()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [active, gamePhase, turn, setTimers, setGamePhase, roomChannel, emitSync])

  // Handle incoming TIMER_SYNC — reconcile if drift is too large
  const handleTimerSync = useCallback(
    (timeWhiteIncoming: number, timeBlackIncoming: number) => {
      const whiteDrift = Math.abs(timeWhiteRef.current - timeWhiteIncoming)
      const blackDrift = Math.abs(timeBlackRef.current - timeBlackIncoming)

      if (whiteDrift > DRIFT_THRESHOLD_SECONDS || blackDrift > DRIFT_THRESHOLD_SECONDS) {
        timeWhiteRef.current = timeWhiteIncoming
        timeBlackRef.current = timeBlackIncoming
        setTimers(timeWhiteIncoming, timeBlackIncoming)
      }
    },
    [setTimers]
  )

  return { handleTimerSync }
}
