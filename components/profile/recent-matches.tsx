'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, ShieldAlert, Swords, Bot } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Match {
  id: string
  opponent_name: string | null
  pgn: string
  winner: string | null
  mode: string
  status: string
  created_at: string
}

interface RecentMatchesProps {
  matches: Match[]
  currentUserId: string
  currentUserColor: 'white' | 'black'
}

export function RecentMatches({ matches }: RecentMatchesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getMatchResult = (match: Match) => {
    if (match.winner === 'draw') {
      return {
        label: 'DRAW',
        badge: 'text-muted-foreground border-muted-foreground/30 bg-muted/10',
        rowGlow: '',
        icon: '◈',
        iconColor: 'oklch(0.6 0.05 280)',
      }
    }
    const userWon = match.winner === 'white'
    if (userWon) {
      return {
        label: 'VICTORY',
        badge: 'text-neon-cyan border-neon-cyan bg-neon-cyan/10 font-bold',
        rowGlow: 'shadow-[inset_4px_0_0_oklch(0.7_0.2_195)]',
        icon: '✦',
        iconColor: 'oklch(0.7 0.2 195)',
      }
    }
    return {
      label: 'DEFEAT',
      badge: 'text-neon-pink border-neon-pink bg-neon-pink/10 font-bold',
      rowGlow: 'shadow-[inset_4px_0_0_oklch(0.7_0.22_330)]',
      icon: '✗',
      iconColor: 'oklch(0.7 0.22 330)',
    }
  }

  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-10 border border-border/60 bg-gradient-to-b from-card/20 to-background/40 text-center relative overflow-hidden"
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-purple/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-purple/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-purple/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-purple/30" />

        <ShieldAlert className="h-7 w-7 text-muted-foreground/40 mb-3 animate-pulse" />
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">No duels fought in this cycle</p>
        <p className="font-mono text-[8px] text-muted-foreground/40 uppercase mt-2">Step onto the board to cast your first checkmate</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-border/70 bg-zinc-950 overflow-hidden relative"
      style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.6)' }}
    >
      {/* Top shimmer bar */}
      <div className="absolute top-0 left-0 right-0 h-px animate-shimmer opacity-50" />

      {/* Corner pixels */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-purple/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-purple/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-purple/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-purple/30" />

      {/* Header row */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-3 bg-black/30 border-b border-border/40 font-mono text-[8px] tracking-widest uppercase text-muted-foreground/60">
        <span>Mode</span>
        <span>Opponent</span>
        <span className="text-center">Result</span>
        <span className="text-right">Fought</span>
        <span className="text-right">PGN</span>
      </div>

      <div className="flex flex-col divide-y divide-border/20">
        <AnimatePresence>
          {matches.map((match, idx) => {
            const result = getMatchResult(match)
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`group grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 items-center px-4 py-3 hover:bg-white/[0.025] transition-all duration-200 relative ${result.rowGlow}`}
              >
                {/* Result icon accent (left border hint) */}
                <div className="flex items-center justify-center w-6">
                  {match.mode === 'ai' ? (
                    <Bot className="h-3.5 w-3.5 text-neon-purple/70" />
                  ) : (
                    <Swords className="h-3.5 w-3.5 text-neon-cyan/70" />
                  )}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-mono text-[9px] font-bold text-foreground/90 truncate">
                    {match.opponent_name || (match.mode === 'ai' ? 'Stockfish AI' : 'Unknown Mage')}
                  </span>
                  <span className="font-mono text-[7px] text-muted-foreground/50 uppercase tracking-widest">
                    {match.mode === 'ai' ? 'VS COGNITIVE ENGINE' : 'ARCANE PVP'}
                  </span>
                </div>

                {/* Result badge */}
                <div className="flex items-center gap-1.5 justify-center">
                  <span
                    className="font-bold text-[9px] animate-twinkle opacity-70"
                    style={{ color: result.iconColor, '--dur': '2s' } as React.CSSProperties}
                  >
                    {result.icon}
                  </span>
                  <Badge
                    variant="outline"
                    className={`rounded-none font-mono text-[7px] px-2 py-0.5 tracking-widest border transition-all duration-300 ${result.badge}`}
                  >
                    {result.label}
                  </Badge>
                </div>

                <span className="font-mono text-[7px] text-muted-foreground/50 uppercase text-right whitespace-nowrap">
                  {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                </span>

                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(match.pgn, match.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/5 rounded-none border border-transparent hover:border-neon-cyan/20 transition-all duration-200"
                    title="Copy PGN"
                  >
                    {copiedId === match.id ? (
                      <Check className="h-3 w-3 text-neon-cyan" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
