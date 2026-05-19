'use client'

/**
 * LobbyPanel — multiplayer entry point.
 * Handles: Create Room, Join by ID, and Quickmatch flows.
 *
 * Accepts optional userId/username props to avoid depending on async useAuth().
 * When rendered inside the profile page, pass them from server data.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Zap, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { createRoomAction } from '@/actions/room'
import { startMatchmaking } from '@/lib/multiplayer/matchmaking'
import { FantasyPixelCard } from '@/components/ui/fantasy-pixel-card'


const TIME_CONTROLS = [
  { label: 'BULLET', subLabel: '1 MIN', seconds: 60, icon: '⚡' },
  { label: 'BLITZ',  subLabel: '5 MIN', seconds: 300, icon: '🔥' },
  { label: 'RAPID',  subLabel: '10 MIN', seconds: 600, icon: '⏱' },
]

interface LobbyPanelProps {
  /** Pass from server component to avoid async useAuth() race */
  userId?: string
  username?: string
}

export function LobbyPanel({ userId: userIdProp, username: usernameProp }: LobbyPanelProps = {}) {
  const router = useRouter()
  // Fallback to client-side auth only when props aren't provided
  const { user, profile } = useAuth()
  const userId   = userIdProp   ?? user?.id
  const username = usernameProp ?? profile?.username ?? `Mage#${user?.id?.slice(0, 4) ?? '????'}`

  const [selectedTimeControl, setSelectedTimeControl] = useState(300)
  const [joinRoomId, setJoinRoomId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isMatchmaking, setIsMatchmaking] = useState(false)
  const [matchmakingCancel, setMatchmakingCancel] = useState<(() => Promise<void>) | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Create Room ─────────────────────────────────────────────────────────────
  const handleCreateRoom = async () => {
    if (!userId) {
      setError('Sign in to create a room')
      return
    }
    setIsCreating(true)
    setError(null)

    try {
      const { roomId, error: roomError } = await createRoomAction(userId, selectedTimeControl)

      if (roomError || !roomId) {
        setError(roomError ?? 'Failed to create room. Is the database schema applied?')
        setIsCreating(false)
        return
      }

      // Persist last room in localStorage for reconnection detection
      localStorage.setItem('chess_last_room', roomId)

      // Navigate to room page — the hook initialises there
      router.push(`/play/room/${roomId}`)
    } catch (err: any) {
      console.error('[LobbyPanel] createRoom threw:', err)
      setError(err?.message ?? 'Unexpected error. Check console.')
      setIsCreating(false)
    }
  }

  // ── Join Room ───────────────────────────────────────────────────────────────
  const handleJoinRoom = async () => {
    const id = joinRoomId.trim().toUpperCase()
    if (!id || id.length < 4) {
      setError('Enter a valid room ID')
      return
    }
    if (!userId) {
      setError('Sign in to join a room')
      return
    }
    setIsJoining(true)
    setError(null)
    // Navigate to room page — joining is handled there
    router.push(`/play/room/${id}`)
  }

  // ── Quickmatch ──────────────────────────────────────────────────────────────
  const handleQuickmatch = async () => {
    if (!userId) {
      setError('Sign in to use quickmatch')
      return
    }
    setIsMatchmaking(true)
    setError(null)

    try {
      const handle = await startMatchmaking(
        userId,
        username,
        selectedTimeControl,
        (roomId, playerColor) => {
          setIsMatchmaking(false)
          router.push(`/play/room/${roomId}`)
        },
        (msg) => {
          setError(msg)
          setIsMatchmaking(false)
        }
      )
      setMatchmakingCancel(() => handle.cancel)
    } catch (err: any) {
      setError(err?.message ?? 'Matchmaking error')
      setIsMatchmaking(false)
    }
  }

  const handleCancelMatchmaking = async () => {
    if (matchmakingCancel) {
      await matchmakingCancel()
      setMatchmakingCancel(null)
    }
    setIsMatchmaking(false)
  }

  return (
    <div className="flex flex-col gap-6 w-full relative z-10">

      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-5 w-5 text-zinc-400" />
          <h2 className="font-mono text-[11px] font-bold tracking-widest text-zinc-100 uppercase">
            ONLINE MULTIPLAYER
          </h2>
        </div>
        <div className="h-px w-24 mx-auto bg-white/[0.08]" />
      </div>

      {/* Time Control Selector */}
      <FantasyPixelCard theme="default" title="TIME PORTAL">
        <div className="flex flex-col gap-3 p-1">
          <label className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase font-bold">
            TIME CONTROL SETTING
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {TIME_CONTROLS.map((tc) => {
              const isSelected = selectedTimeControl === tc.seconds
              return (
                <button
                  key={tc.seconds}
                  onClick={() => setSelectedTimeControl(tc.seconds)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 border-2 transition-all duration-200 font-mono text-[9px] sm:text-[10px] tracking-wider uppercase group relative rounded-none cursor-pointer
                    ${isSelected
                      ? 'border-[#FACC15] text-[#FACC15] bg-[#FACC15]/10 shadow-[4px_4px_0px_#000000] font-bold'
                      : 'border-[#4A5568] text-[#8D99AE] hover:border-[#8D99AE] hover:text-[#BFC7D5] bg-[#2D3748]/40'
                    }`}
                >
                  {/* Corner pixel markers for selected */}
                  {isSelected && (
                    <>
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#FACC15]" />
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FACC15]" />
                      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#FACC15]" />
                      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#FACC15]" />
                    </>
                  )}
                  <span className="text-base">{tc.icon}</span>
                  <span>{tc.label}</span>
                  <span className="text-[8px] opacity-60 leading-none mt-1">{tc.subLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      </FantasyPixelCard>

      {/* Create Room */}
      <FantasyPixelCard theme="cyan" title="CONJURE ROOM">
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center gap-2">
            <Plus className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-mono text-[9px] tracking-widest text-[#BFC7D5] uppercase font-bold">CREATE PRIVATE ROOM</span>
          </div>
          <p className="font-mono text-[9px] text-[#8D99AE] leading-relaxed uppercase tracking-wide">
            Initiate a localized arena room and dispatch the attunement identifier link to your opponent.
          </p>
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-[#BFC7D5] hover:bg-[#D9E1EE] text-zinc-950 font-mono font-bold text-[9px] sm:text-[10px] tracking-widest cursor-pointer transition-all uppercase rounded-none border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            id="create-room-btn"
          >
            {isCreating ? (
              <><div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent animate-spin rounded-none" /> CONJURING ROOM...</>
            ) : (
              <><Plus className="h-3.5 w-3.5" /> CREATE ROOM</>
            )}
          </button>
        </div>
      </FantasyPixelCard>

      {/* Join Room */}
      <FantasyPixelCard theme="purple" title="VOID PORTAL">
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-mono text-[9px] tracking-widest text-[#8D99AE] uppercase font-bold">JOIN BY ROOM ID</span>
          </div>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              placeholder="ENTER ROOM ID..."
              maxLength={10}
              className="flex-1 bg-[#1E2530] border-2 border-[#4A5568] px-3 py-2.5 font-mono text-[10px] text-white tracking-widest placeholder:text-[#4A5568] focus:border-[#8D99AE] focus:outline-none transition-all rounded-none hover:border-[#8D99AE]"
              id="join-room-input"
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !joinRoomId.trim()}
              className="px-5 bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 font-mono text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all rounded-none border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
              id="join-room-btn"
            >
              {isJoining ? <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent animate-spin rounded-none" /> : 'JOIN'}
            </button>
          </div>
        </div>
      </FantasyPixelCard>

      {/* Quickmatch */}
      <FantasyPixelCard theme="gold" title="BATTLE ARENA">
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-[#FACC15]" />
            <span className="font-mono text-[9px] tracking-widest text-[#FACC15] uppercase font-bold">QUICKMATCH</span>
          </div>
          <p className="font-mono text-[9px] text-[#8D99AE] leading-relaxed uppercase tracking-wide">
            Automated wizard alignment matrix. Instantly pairs you with an active opponent.
          </p>

          {isMatchmaking ? (
            <div className="flex flex-col items-center gap-3 py-4 bg-zinc-950/40 border-2 border-[#4A5568] rounded-none mt-1 shadow-[2px_2px_0px_#000000]">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-[#4A5568] border-t-[#FACC15] animate-spin rounded-none" />
              </div>
              <span className="font-mono text-[8px] tracking-widest text-[#8D99AE] uppercase font-bold animate-pulse">
                SEARCHING FOR OPPONENT...
              </span>
              <button
                onClick={handleCancelMatchmaking}
                className="font-mono text-[8px] tracking-widest text-[#8D99AE] hover:text-[#BFC7D5] transition-colors uppercase font-bold underline underline-offset-2 mt-1 cursor-pointer"
              >
                cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleQuickmatch}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-[#FACC15] hover:bg-[#FDE047] text-zinc-950 font-mono font-bold text-[9px] sm:text-[10px] tracking-widest cursor-pointer transition-all uppercase rounded-none border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]"
              id="quickmatch-btn"
            >
              <Zap className="h-3.5 w-3.5" /> FIND OPPONENT
            </button>
          )}
        </div>
      </FantasyPixelCard>

      {/* Error display */}
      {error && (
        <div className="px-4 py-3 border-2 border-rose-500 bg-rose-950/30 font-mono text-[8px] tracking-widest text-rose-400 uppercase rounded-none text-center shadow-[2px_2px_0px_#000000]">
          ⚠ {error}
        </div>
      )}

      {/* Sign-in reminder */}
      {!userId && (
        <div className="px-4 py-3 border-2 border-zinc-800 bg-zinc-950/50 font-mono text-[8px] tracking-widest text-zinc-500 uppercase rounded-none text-center">
          SIGN IN TO PLAY ONLINE
        </div>
      )}
    </div>
  )
}

