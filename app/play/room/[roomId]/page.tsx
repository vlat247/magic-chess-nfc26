'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flag, Share2, Home } from 'lucide-react'

import { Header } from '@/components/arcane-chess/header'
import { MagicParticles } from '@/components/arcane-chess/magic-particles'
import { MultiplayerGameBoard } from '@/components/multiplayer/multiplayer-game-board'
import { OpponentPanel } from '@/components/multiplayer/opponent-panel'
import { RoomWaitingScreen } from '@/components/multiplayer/room-waiting-screen'
import { DisconnectOverlay, ResignConfirm } from '@/components/multiplayer/disconnect-overlay'
import { InviteModal } from '@/components/multiplayer/invite-modal'

import { useMultiplayerRoom } from '@/hooks/use-multiplayer-room'
import { useMultiplayerStore } from '@/store/multiplayer-store'
import { useAuth } from '@/hooks/use-auth'
import { getRoom } from '@/lib/multiplayer/room-manager'

// ── Inline move history (reads from multiplayer store) ────────────────────────
function MultiplayerMoveHistory() {
  const pgnHistory = useMultiplayerStore((s) => s.pgnHistory)
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Move History</span>
        <div className="flex-1 h-px bg-[oklch(0.2_0.04_280)]" />
      </div>
      <div className="overflow-y-auto max-h-40 border border-[oklch(0.18_0.04_280)] bg-[oklch(0.09_0.02_280)] p-2" style={{ scrollbarWidth: 'thin' }}>
        {pgnHistory.length === 0 ? (
          <p className="font-mono text-[8px] tracking-widest text-muted-foreground/50 text-center py-4">NO MOVES YET</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {Array.from({ length: Math.ceil(pgnHistory.length / 2) }).map((_, i) => (
              <div key={i} className="contents">
                <div className="flex items-center gap-2 py-0.5">
                  <span className="font-mono text-[8px] text-muted-foreground/60 w-5">{i + 1}.</span>
                  <span className="font-mono text-[9px] text-neon-cyan">{pgnHistory[i * 2]}</span>
                </div>
                {pgnHistory[i * 2 + 1] && (
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="font-mono text-[9px] text-muted-foreground/80">{pgnHistory[i * 2 + 1]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Ambient background layers ─────────────────────────────────────────────────
function AmbientLayers() {
  return (
    <>
      <div className="absolute inset-0 opacity-10 animate-grid pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="absolute inset-0 pointer-events-none opacity-30 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,25,0.95)_100%)] z-0" />
    </>
  )
}

// ── Loading spinner ───────────────────────────────────────────────────────────
function LoadingRoom({ message = 'ENTERING BATTLE ROOM...' }: { message?: string }) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[oklch(0.08_0.02_280)] to-[oklch(0.15_0.06_300)] overflow-hidden">
      <MagicParticles />
      <AmbientLayers />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 border-4 border-dashed border-neon-purple rounded-full animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute w-20 h-20 border-2 border-dotted border-neon-cyan rounded-full animate-spin" style={{ animationDuration: '7s', animationDirection: 'reverse' }} />
          <div className="absolute w-12 h-12 border border-neon-gold rounded-full animate-pulse" />
        </div>
        <p className="font-mono text-xs tracking-widest text-neon-gold animate-pulse">{message}</p>
      </div>
    </main>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MultiplayerRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = typeof params.roomId === 'string' ? params.roomId : ''
  const { user, profile, isLoading: authLoading } = useAuth()
  const username = profile?.username ?? `Mage#${user?.id?.slice(0, 4) ?? '????'}`

  // Multiplayer store state
  const gamePhase    = useMultiplayerStore((s) => s.gamePhase)
  const winner       = useMultiplayerStore((s) => s.winner)
  const isCheckmate  = useMultiplayerStore((s) => s.isCheckmate)
  const isStalemate  = useMultiplayerStore((s) => s.isStalemate)
  const isDraw       = useMultiplayerStore((s) => s.isDraw)
  const opponentStatus = useMultiplayerStore((s) => s.opponentStatus)
  const playerColor  = useMultiplayerStore((s) => s.playerColor)
  const storeError   = useMultiplayerStore((s) => s.error)

  const {
    joinExistingRoom,
    makeMultiplayerMove,
    resignGame,
    leaveRoom,
    isMyTurn,
    disconnectCountdown,
  } = useMultiplayerRoom(user?.id ?? null, username)

  const [showInvite, setShowInvite]   = useState(false)
  const [showResign, setShowResign]   = useState(false)
  const [initDone, setInitDone]       = useState(false)
  const [initError, setInitError]     = useState<string | null>(null)
  const initCalledRef                 = useRef(false)

  // ── Room initialization — runs once when auth is ready ────────────────────
  useEffect(() => {
    // Wait for auth to finish loading and user to be available
    if (authLoading || !user?.id || !roomId) return
    // Only run once
    if (initCalledRef.current) return
    initCalledRef.current = true

    const init = async () => {
      try {
        const room = await getRoom(roomId)

        if (!room) {
          // Room doesn't exist in DB at all
          setInitError('Room not found. The link may be invalid or expired.')
          setInitDone(true)
          return
        }

        if (room.status === 'finished' || room.status === 'abandoned') {
          setInitError('This battle has already ended.')
          setInitDone(true)
          return
        }

        // joinExistingRoom handles both: new guest join AND reconnect
        const success = await joinExistingRoom(roomId, user.id, username)

        if (!success) {
          setInitError(storeError ?? 'Could not join room. Please try again.')
        } else {
          // Host gets invite modal on first load
          const isHost = room.host_id === user.id
          if (isHost && room.status === 'waiting') {
            setTimeout(() => setShowInvite(true), 600)
          }
        }
      } catch (err: any) {
        console.error('[RoomPage] init error:', err)
        setInitError(err?.message ?? 'Unexpected error. Check console.')
      } finally {
        setInitDone(true)
      }
    }

    init()
  }, [authLoading, user?.id, roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClaimVictory = useCallback(() => {
    useMultiplayerStore.setState({ gamePhase: 'finished', winner: playerColor ?? 'white' })
  }, [playerColor])

  // ── Render: waiting for auth ──────────────────────────────────────────────
  if (authLoading) {
    return <LoadingRoom message="AUTHENTICATING..." />
  }

  // ── Render: not signed in ─────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[oklch(0.08_0.02_280)] to-[oklch(0.15_0.06_300)]">
        <MagicParticles />
        <div className="relative z-10 text-center flex flex-col gap-4">
          <p className="font-mono text-xs tracking-widest text-neon-gold">SIGN IN TO JOIN THIS BATTLE</p>
          <Link href="/profile" className="font-mono text-[9px] tracking-widest text-neon-purple hover:text-neon-cyan transition-colors">← RETURN TO LOBBY</Link>
        </div>
      </main>
    )
  }

  // ── Render: initializing (joining room) ───────────────────────────────────
  if (!initDone) {
    return <LoadingRoom message="JOINING BATTLE ROOM..." />
  }

  // ── Render: init error ────────────────────────────────────────────────────
  if (initError) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[oklch(0.08_0.02_280)] to-[oklch(0.15_0.06_300)]">
        <MagicParticles />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm px-4">
          <p className="font-mono text-xs tracking-widest text-destructive">{initError}</p>
          <Link href="/profile" className="font-mono text-[9px] tracking-widest text-neon-purple hover:text-neon-cyan transition-colors">← RETURN TO LOBBY</Link>
        </div>
      </main>
    )
  }

  // ── Render: main game page ────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)] overflow-x-hidden pt-24 pb-8 px-4 flex flex-col items-center">
      <Header />
      <MagicParticles />
      <AmbientLayers />

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6 items-center">

        {/* Room title */}
        <header className="text-center flex flex-col items-center">
          <h1 className="text-2xl md:text-4xl font-title text-glow-gold text-neon-gold tracking-wider">
            ARCANE DUEL
          </h1>
          <div className="mt-1 h-0.5 w-20 bg-neon-purple animate-pulse" />
          <span className="mt-2 font-mono text-[9px] tracking-widest text-neon-cyan/70">
            ROOM: {roomId}
          </span>
        </header>

        {/* Waiting for opponent */}
        {gamePhase === 'waiting' && (
          <RoomWaitingScreen roomId={roomId} onCancel={leaveRoom} />
        )}

        {/* Active / finished game */}
        {(gamePhase === 'active' || gamePhase === 'finished') && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">

            {/* Board */}
            <div className="lg:col-span-7 flex justify-center w-full relative">
              <MultiplayerGameBoard onMove={makeMultiplayerMove} isMyTurn={isMyTurn} />

              {opponentStatus === 'offline' && gamePhase === 'active' && disconnectCountdown !== null && (
                <DisconnectOverlay countdown={disconnectCountdown} onClaimVictory={handleClaimVictory} />
              )}

              {showResign && (
                <ResignConfirm
                  onConfirm={() => { resignGame(); setShowResign(false) }}
                  onCancel={() => setShowResign(false)}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-5 flex flex-col gap-5 w-full max-w-[480px] mx-auto lg:max-w-none">
              <OpponentPanel />

              {gamePhase === 'finished' && (
                <div
                  className="px-4 py-5 border-2 border-neon-gold/60 bg-neon-gold/5 text-center flex flex-col gap-2"
                  style={{ boxShadow: '0 0 30px oklch(0.8 0.18 85 / 0.3)' }}
                >
                  <p className="font-mono text-xs tracking-widest text-neon-gold text-glow-gold">
                    {isCheckmate ? 'CHECKMATE!' : isStalemate ? 'STALEMATE' : isDraw ? 'DRAW' : 'GAME OVER'}
                  </p>
                  <p className="font-mono text-[9px] tracking-widest text-muted-foreground">
                    {winner === playerColor ? '⚔ VICTORY — YOU WIN!' : winner === 'draw' ? '🤝 THE BATTLE ENDS IN PEACE' : '💀 DEFEAT — BETTER LUCK NEXT TIME'}
                  </p>
                </div>
              )}

              <MultiplayerMoveHistory />

              <div className="flex flex-col gap-2">
                {gamePhase === 'active' && (
                  <>
                    <button
                      onClick={() => setShowInvite(true)}
                      className="flex items-center justify-center gap-2 py-3 border-2 border-[oklch(0.25_0.06_280)] text-muted-foreground font-mono text-xs tracking-wider hover:border-neon-purple/50 hover:text-neon-purple transition-all"
                      id="share-room-btn"
                    >
                      <Share2 className="h-4 w-4" /> INVITE LINK
                    </button>
                    <button
                      onClick={() => setShowResign(true)}
                      className="flex items-center justify-center gap-2 py-3 border-2 border-destructive/50 text-destructive/70 font-mono text-xs tracking-wider hover:bg-destructive/10 hover:border-destructive transition-all"
                      id="resign-btn"
                    >
                      <Flag className="h-4 w-4" /> RESIGN
                    </button>
                  </>
                )}
                <button
                  onClick={leaveRoom}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-neon-purple/50 text-neon-purple font-mono text-xs tracking-wider hover:bg-neon-purple/10 transition-all"
                  id="leave-room-btn"
                >
                  <Home className="h-4 w-4" /> LEAVE BATTLEFIELD
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <InviteModal roomId={roomId} isOpen={showInvite} onClose={() => setShowInvite(false)} />
    </main>
  )
}
