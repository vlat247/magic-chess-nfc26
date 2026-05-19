'use client'

/**
 * RoomWaitingScreen — shown to host while waiting for opponent to join.
 */

import { useEffect, useState } from 'react'
import { Copy, Check, X, Users } from 'lucide-react'

interface RoomWaitingScreenProps {
  roomId: string
  onCancel: () => void
}

function formatTimeControl(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m`
}

export function RoomWaitingScreen({ roomId, onCancel }: RoomWaitingScreenProps) {
  const [copied, setCopied] = useState(false)
  const [dots, setDots] = useState('.')

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/play/room/${roomId}`
    : `/play/room/${roomId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
    }
  }

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto py-8">
      {/* Animated portal ring */}
      <div className="relative flex items-center justify-center">
        <div
          className="w-28 h-28 border-4 border-dashed border-neon-purple rounded-full animate-spin"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute w-20 h-20 border-2 border-dotted border-neon-cyan rounded-full animate-spin"
          style={{ animationDuration: '7s', animationDirection: 'reverse' }}
        />
        <div className="absolute w-12 h-12 border border-neon-gold rounded-full animate-pulse" />
        <Users className="absolute h-5 w-5 text-neon-gold" style={{ filter: 'drop-shadow(0 0 6px oklch(0.8 0.18 85))' }} />
      </div>

      {/* Status */}
      <div className="text-center">
        <p className="font-mono text-sm tracking-widest text-neon-gold text-glow-gold">
          WAITING FOR OPPONENT{dots}
        </p>
        <p className="mt-2 font-mono text-[9px] tracking-widest text-muted-foreground">
          SHARE THE ROOM LINK TO INVITE A PLAYER
        </p>
      </div>

      {/* Room ID display */}
      <div className="w-full flex flex-col gap-2">
        <label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
          Room ID
        </label>
        <div
          className="px-4 py-3 border-2 border-neon-gold/40 bg-[oklch(0.09_0.02_280)] text-center"
          style={{ boxShadow: '0 0 20px oklch(0.8 0.18 85 / 0.1)' }}
        >
          <span className="font-mono text-2xl tracking-[0.5em] text-neon-gold text-glow-gold select-all">
            {roomId}
          </span>
        </div>
      </div>

      {/* Invite link copy */}
      <div className="w-full flex flex-col gap-2">
        <label className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
          Invite Link
        </label>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 border-2 border-[oklch(0.2_0.04_280)] bg-[oklch(0.09_0.02_280)] font-mono text-[9px] text-muted-foreground truncate overflow-hidden">
            {inviteUrl}
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2 border-2 font-mono text-[9px] tracking-wider transition-all duration-200
              ${copied
                ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                : 'border-[oklch(0.25_0.06_280)] text-muted-foreground hover:border-neon-cyan/50 hover:text-neon-cyan'
              }`}
            id="copy-invite-btn"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'COPIED!' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-muted-foreground hover:text-destructive transition-colors"
        id="cancel-waiting-btn"
      >
        <X className="h-3.5 w-3.5" />
        CANCEL AND RETURN TO LOBBY
      </button>
    </div>
  )
}
