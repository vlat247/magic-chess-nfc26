'use client'

import { User, Wifi, WifiOff } from 'lucide-react'
import { useMultiplayerStore } from '@/store/multiplayer-store'

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ClockDisplay({ seconds, isActive, label }: { seconds: number; isActive: boolean; label: string }) {
  const isLow = seconds < 30
  const isCritical = seconds < 10
  return (
    <div className={`flex flex-col items-center gap-1 px-4 py-3 border-2 transition-all duration-300 ${isActive ? isCritical ? 'border-destructive bg-destructive/10 animate-pulse' : isLow ? 'border-neon-gold bg-neon-gold/5' : 'border-neon-cyan bg-neon-cyan/5' : 'border-[oklch(0.2_0.04_280)] bg-[oklch(0.09_0.02_280)] opacity-60'}`} style={isActive ? { boxShadow: isCritical ? '0 0 12px oklch(0.577 0.245 27 / 0.4)' : isLow ? '0 0 12px oklch(0.8 0.18 85 / 0.3)' : '0 0 12px oklch(0.7 0.2 195 / 0.2)' } : {}}>
      <span className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase">{label}</span>
      <span className={`font-mono text-2xl md:text-3xl font-bold tracking-wider tabular-nums ${isActive ? isCritical ? 'text-destructive' : isLow ? 'text-neon-gold' : 'text-neon-cyan' : 'text-muted-foreground'}`} style={isActive ? { textShadow: isCritical ? '0 0 12px oklch(0.577 0.245 27 / 0.8)' : isLow ? '0 0 12px oklch(0.8 0.18 85 / 0.8)' : '0 0 12px oklch(0.7 0.2 195 / 0.8)' } : {}}>
        {formatTime(seconds)}
      </span>
    </div>
  )
}

export function OpponentPanel() {
  const playerColor = useMultiplayerStore((s) => s.playerColor)
  const opponentUsername = useMultiplayerStore((s) => s.opponentUsername)
  const opponentStatus = useMultiplayerStore((s) => s.opponentStatus)
  const turn = useMultiplayerStore((s) => s.turn)
  const timeWhite = useMultiplayerStore((s) => s.timeWhite)
  const timeBlack = useMultiplayerStore((s) => s.timeBlack)
  const isCheckmate = useMultiplayerStore((s) => s.isCheckmate)
  const isStalemate = useMultiplayerStore((s) => s.isStalemate)
  const isDraw = useMultiplayerStore((s) => s.isDraw)

  const myColor = playerColor ?? 'white'
  const opponentColor = myColor === 'white' ? 'black' : 'white'
  const isMyTurnNow = (myColor === 'white' && turn === 'w') || (myColor === 'black' && turn === 'b')
  const gameIsOver = isCheckmate || isStalemate || isDraw
  const myTime = myColor === 'white' ? timeWhite : timeBlack
  const opponentTime = opponentColor === 'white' ? timeWhite : timeBlack
  const isOnline = opponentStatus === 'online'

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-3 px-4 py-3 border border-[oklch(0.2_0.04_280)] bg-[oklch(0.09_0.02_280)]">
        <div className="w-9 h-9 flex items-center justify-center border border-[oklch(0.25_0.06_280)]" style={{ background: 'oklch(0.15 0.05 300)' }}>
          <User className="h-4 w-4" style={{ color: 'oklch(0.7 0.2 300)' }} />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="font-mono text-[10px] tracking-wider" style={{ color: 'oklch(0.85 0.05 280)' }}>
            {opponentUsername ?? 'Waiting for opponent...'}
          </span>
          <div className="flex items-center gap-1.5">
            {isOnline ? <Wifi className="h-2.5 w-2.5 text-neon-cyan" /> : <WifiOff className="h-2.5 w-2.5 text-destructive animate-pulse" />}
            <span className={`font-mono text-[8px] tracking-widest ${isOnline ? 'text-neon-cyan' : 'text-destructive'}`}>
              {opponentStatus === 'online' ? 'ONLINE' : opponentStatus === 'reconnecting' ? 'RECONNECTING...' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 border border-[oklch(0.3_0.05_280)]" style={{ background: opponentColor === 'white' ? 'oklch(0.9 0.01 280)' : 'oklch(0.15 0.02 280)' }} />
          <span className="font-mono text-[7px] tracking-widest text-muted-foreground uppercase">{opponentColor}</span>
        </div>
      </div>

      {!gameIsOver && (
        <div className="grid grid-cols-2 gap-2">
          <ClockDisplay seconds={opponentTime} isActive={!gameIsOver && !isMyTurnNow} label={`${opponentColor.toUpperCase()} (OPP)`} />
          <ClockDisplay seconds={myTime} isActive={!gameIsOver && isMyTurnNow} label={`${myColor.toUpperCase()} (YOU)`} />
        </div>
      )}

      {!gameIsOver && (
        <div className={`px-4 py-2 text-center font-mono text-[9px] tracking-widest border transition-all duration-500 ${isMyTurnNow ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/5 animate-pulse' : 'border-[oklch(0.2_0.04_280)] text-muted-foreground'}`}>
          {isMyTurnNow ? '⚔ YOUR TURN — MAKE A MOVE' : '⏳ OPPONENT IS THINKING...'}
        </div>
      )}
    </div>
  )
}
