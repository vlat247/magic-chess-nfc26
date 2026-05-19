'use client'

/**
 * LobbyPanel — multiplayer entry point rendered in /play when Online mode is selected.
 * Handles: Create Room, Join by ID, and Quickmatch flows.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Zap, Clock, Copy, ArrowRight, Loader2 } from 'lucide-react'
import { useMultiplayerRoom } from '@/hooks/use-multiplayer-room'
import { useAuth } from '@/hooks/use-auth'
import { startMatchmaking } from '@/lib/multiplayer/matchmaking'

const TIME_CONTROLS = [
  { label: 'BULLET', subLabel: '1 MIN', seconds: 60, icon: '⚡' },
  { label: 'BLITZ', subLabel: '5 MIN', seconds: 300, icon: '🔥' },
  { label: 'RAPID', subLabel: '10 MIN', seconds: 600, icon: '⏱' },
]

export function LobbyPanel() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const username = profile?.username ?? `Mage#${user?.id?.slice(0, 4) ?? '????'}`

  const { createAndEnterRoom } = useMultiplayerRoom(user?.id ?? null, username)

  const [selectedTimeControl, setSelectedTimeControl] = useState(300)
  const [joinRoomId, setJoinRoomId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isMatchmaking, setIsMatchmaking] = useState(false)
  const [matchmakingCancel, setMatchmakingCancel] = useState<(() => Promise<void>) | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateRoom = async () => {
    if (!user?.id) {
      setError('Sign in to create a room')
      return
    }
    setIsCreating(true)
    setError(null)
    const roomId = await createAndEnterRoom(user.id, username, selectedTimeControl)
    if (roomId) {
      router.push(`/play/room/${roomId}`)
    } else {
      setError('Failed to create room. Try again.')
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    const id = joinRoomId.trim().toUpperCase()
    if (!id || id.length < 4) {
      setError('Enter a valid room ID')
      return
    }
    setIsJoining(true)
    router.push(`/play/room/${id}`)
  }

  const handleQuickmatch = async () => {
    if (!user?.id) {
      setError('Sign in to use quickmatch')
      return
    }
    setIsMatchmaking(true)
    setError(null)

    const handle = await startMatchmaking(
      user.id,
      username,
      selectedTimeControl,
      (roomId, playerColor) => {
        setIsMatchmaking(false)
        router.push(`/play/room/${roomId}?color=${playerColor}`)
      },
      (msg) => {
        setError(msg)
        setIsMatchmaking(false)
      }
    )

    setMatchmakingCancel(() => handle.cancel)
  }

  const handleCancelMatchmaking = async () => {
    if (matchmakingCancel) {
      await matchmakingCancel()
      setMatchmakingCancel(null)
    }
    setIsMatchmaking(false)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-5 w-5 text-neon-purple" style={{ filter: 'drop-shadow(0 0 6px oklch(0.7 0.25 300))' }} />
          <h2 className="font-mono text-sm tracking-widest text-neon-purple text-glow-purple">
            ONLINE MULTIPLAYER
          </h2>
        </div>
        <div className="h-px w-24 mx-auto bg-neon-purple opacity-40" />
      </div>

      {/* Time Control Selector */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
          Time Control
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TIME_CONTROLS.map((tc) => (
            <button
              key={tc.seconds}
              onClick={() => setSelectedTimeControl(tc.seconds)}
              className={`flex flex-col items-center gap-1 py-3 px-2 border-2 transition-all duration-200 font-mono text-xs tracking-wider
                ${selectedTimeControl === tc.seconds
                  ? 'border-neon-gold text-neon-gold bg-neon-gold/5'
                  : 'border-[oklch(0.2_0.04_280)] text-muted-foreground hover:border-neon-gold/40 hover:text-neon-gold/60'
                }`}
              style={selectedTimeControl === tc.seconds ? {
                boxShadow: '0 0 12px oklch(0.8 0.18 85 / 0.3)',
              } : {}}
            >
              <span className="text-base">{tc.icon}</span>
              <span>{tc.label}</span>
              <span className="text-[9px] opacity-70">{tc.subLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Create Room */}
      <div className="flex flex-col gap-3 p-4 border border-[oklch(0.2_0.04_280)] bg-[oklch(0.09_0.02_280)]">
        <div className="flex items-center gap-2">
          <Plus className="h-3.5 w-3.5 text-neon-cyan" />
          <span className="font-mono text-[10px] tracking-widest text-neon-cyan">CREATE ROOM</span>
        </div>
        <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
          Create a private game and share the invite link with your opponent.
        </p>
        <button
          onClick={handleCreateRoom}
          disabled={isCreating}
          className="flex items-center justify-center gap-2 py-3 border-2 border-neon-cyan text-neon-cyan font-mono text-xs tracking-wider transition-all duration-200 hover:bg-neon-cyan/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: '0 0 10px oklch(0.7 0.2 195 / 0.2)' }}
          id="create-room-btn"
        >
          {isCreating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> CONJURING ROOM...</>
          ) : (
            <><Plus className="h-4 w-4" /> CREATE ROOM</>
          )}
        </button>
      </div>

      {/* Join Room */}
      <div className="flex flex-col gap-3 p-4 border border-[oklch(0.2_0.04_280)] bg-[oklch(0.09_0.02_280)]">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-3.5 w-3.5 text-neon-purple" />
          <span className="font-mono text-[10px] tracking-widest text-neon-purple">JOIN BY ROOM ID</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
            placeholder="ENTER ROOM ID..."
            maxLength={10}
            className="flex-1 bg-[oklch(0.12_0.03_280)] border-2 border-[oklch(0.2_0.04_280)] px-3 py-2 font-mono text-xs text-neon-gold tracking-widest placeholder:text-muted-foreground/50 focus:border-neon-purple focus:outline-none transition-colors"
            id="join-room-input"
            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
          />
          <button
            onClick={handleJoinRoom}
            disabled={isJoining || !joinRoomId.trim()}
            className="px-4 border-2 border-neon-purple text-neon-purple font-mono text-xs tracking-wider transition-all duration-200 hover:bg-neon-purple/10 disabled:opacity-40 disabled:cursor-not-allowed"
            id="join-room-btn"
          >
            {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'JOIN'}
          </button>
        </div>
      </div>

      {/* Quickmatch */}
      <div className="flex flex-col gap-3 p-4 border border-[oklch(0.2_0.04_280)] bg-[oklch(0.09_0.02_280)]">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-neon-gold" />
          <span className="font-mono text-[10px] tracking-widest text-neon-gold">QUICKMATCH</span>
        </div>
        <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
          Auto-pair with a random opponent at the selected time control.
        </p>

        {isMatchmaking ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-t-neon-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 w-10 h-10 border-4 border-t-transparent border-r-neon-purple border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
            </div>
            <span className="font-mono text-[9px] tracking-widest text-neon-gold animate-pulse">
              SEARCHING FOR OPPONENT...
            </span>
            <button
              onClick={handleCancelMatchmaking}
              className="font-mono text-[9px] tracking-widest text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
            >
              cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleQuickmatch}
            className="flex items-center justify-center gap-2 py-3 border-2 border-neon-gold text-neon-gold font-mono text-xs tracking-wider transition-all duration-200 hover:bg-neon-gold/10 hover:scale-[1.02] active:scale-[0.98]"
            style={{ boxShadow: '0 0 10px oklch(0.8 0.18 85 / 0.2)' }}
            id="quickmatch-btn"
          >
            <Zap className="h-4 w-4" /> FIND OPPONENT
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 border border-destructive/50 bg-destructive/10 font-mono text-[9px] tracking-widest text-destructive text-center"
        >
          {error}
        </div>
      )}
    </div>
  )
}
