'use client'

import { WifiOff, Trophy, Flag } from 'lucide-react'

interface DisconnectOverlayProps {
  countdown: number
  onClaimVictory: () => void
}

export function DisconnectOverlay({ countdown, onClaimVictory }: DisconnectOverlayProps) {
  const isExpired = countdown <= 0

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-6 px-8 py-10 border-2 border-destructive/60 max-w-sm w-full mx-4"
        style={{ background: 'oklch(0.08 0.02 280)', boxShadow: '0 0 40px oklch(0.577 0.245 27 / 0.4)' }}
      >
        {/* Icon */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-destructive/40 flex items-center justify-center animate-pulse">
            <WifiOff className="h-7 w-7 text-destructive" />
          </div>
          <div className="absolute inset-0 rounded-full border border-destructive/20 animate-ping" />
        </div>

        {/* Message */}
        <div className="text-center flex flex-col gap-2">
          <p className="font-mono text-sm tracking-widest text-destructive" style={{ textShadow: '0 0 10px oklch(0.577 0.245 27 / 0.6)' }}>
            OPPONENT DISCONNECTED
          </p>
          {!isExpired ? (
            <>
              <p className="font-mono text-[9px] tracking-widest text-muted-foreground">
                WAITING FOR RECONNECTION...
              </p>
              <div className="mt-2 flex flex-col items-center gap-1">
                <span className="font-mono text-3xl font-bold tabular-nums text-neon-gold text-glow-gold">
                  {countdown}
                </span>
                <span className="font-mono text-[8px] tracking-widest text-muted-foreground">
                  SECONDS UNTIL FORFEIT
                </span>
              </div>
              <div className="mt-2 w-full bg-[oklch(0.15_0.04_280)] h-1">
                <div
                  className="h-1 bg-destructive transition-all duration-1000"
                  style={{ width: `${(countdown / 30) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <p className="font-mono text-[9px] tracking-widest text-muted-foreground">
              OPPONENT FORFEITED THE MATCH
            </p>
          )}
        </div>

        {/* Claim victory */}
        {isExpired && (
          <button
            onClick={onClaimVictory}
            className="flex items-center gap-2 px-8 py-3 border-2 border-neon-gold text-neon-gold font-mono text-xs tracking-wider transition-all duration-200 hover:bg-neon-gold/10 hover:scale-[1.02] active:scale-[0.98]"
            style={{ boxShadow: '0 0 15px oklch(0.8 0.18 85 / 0.3)' }}
            id="claim-victory-btn"
          >
            <Trophy className="h-4 w-4" />
            CLAIM VICTORY
          </button>
        )}
      </div>
    </div>
  )
}

interface ResignConfirmProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ResignConfirm({ onConfirm, onCancel }: ResignConfirmProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-6 px-8 py-8 border-2 border-neon-gold/40 max-w-xs w-full mx-4"
        style={{ background: 'oklch(0.09 0.02 280)' }}
      >
        <Flag className="h-8 w-8 text-neon-gold" />
        <div className="text-center">
          <p className="font-mono text-xs tracking-widest text-neon-gold">RESIGN THE MATCH?</p>
          <p className="mt-2 font-mono text-[8px] tracking-widest text-muted-foreground">
            YOUR OPPONENT WINS THE GAME
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 border-2 border-destructive text-destructive font-mono text-[9px] tracking-wider hover:bg-destructive/10 transition-all"
            id="confirm-resign-btn"
          >
            RESIGN
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 border-2 border-[oklch(0.3_0.06_280)] text-muted-foreground font-mono text-[9px] tracking-wider hover:border-neon-cyan/40 hover:text-neon-cyan transition-all"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
