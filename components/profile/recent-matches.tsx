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
        badge: 'text-zinc-400 border-zinc-500/20 bg-zinc-500/5 font-mono text-[7px] tracking-widest',
        indicator: 'bg-zinc-500/30',
        icon: '◈',
        iconClass: 'text-zinc-500',
      }
    }
    const userWon = match.winner === 'white'
    if (userWon) {
      return {
        label: 'VICTORY',
        badge: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-mono text-[7px] tracking-widest font-bold',
        indicator: 'bg-emerald-500/50',
        icon: '✦',
        iconClass: 'text-emerald-400',
      }
    }
    return {
      label: 'DEFEAT',
      badge: 'text-rose-400 border-rose-500/20 bg-rose-500/5 font-mono text-[7px] tracking-widest font-bold',
      indicator: 'bg-rose-500/50',
      icon: '◈',
      iconClass: 'text-rose-400',
    }
  }

  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-10 border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl text-center relative overflow-hidden rounded-xl shadow-md"
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10" />

        <ShieldAlert className="h-6 w-6 text-zinc-500 mb-3" />
        <p className="font-mono text-[9px] tracking-widest text-zinc-400 uppercase">No duels fought in this cycle</p>
        <p className="font-mono text-[7px] text-zinc-600 uppercase mt-2">Step onto the board to cast your first checkmate</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl overflow-hidden relative rounded-xl shadow-lg"
    >
      {/* Corner pixels */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10" />

      {/* Header row */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-3 bg-zinc-950/40 border-b border-white/[0.06] font-mono text-[8px] tracking-widest uppercase text-zinc-500">
        <span>Mode</span>
        <span>Opponent</span>
        <span className="text-center">Result</span>
        <span className="text-right">Fought</span>
        <span className="text-right">PGN</span>
      </div>

      <div className="flex flex-col divide-y divide-white/[0.04]">
        <AnimatePresence>
          {matches.map((match, idx) => {
            const result = getMatchResult(match)
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 items-center px-4 py-3 hover:bg-white/[0.02] transition-all duration-200 relative"
              >
                {/* Result left border indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${result.indicator}`} />

                {/* Result icon accent */}
                <div className="flex items-center justify-center w-6">
                  {match.mode === 'ai' ? (
                    <Bot className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-300" />
                  ) : (
                    <Swords className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-300" />
                  )}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-mono text-[9px] font-bold text-zinc-200 truncate group-hover:text-white">
                    {match.opponent_name || (match.mode === 'ai' ? 'Stockfish AI' : 'Unknown Mage')}
                  </span>
                  <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest">
                    {match.mode === 'ai' ? 'VS COGNITIVE ENGINE' : 'ARCANE PVP'}
                  </span>
                </div>

                {/* Result badge */}
                <div className="flex items-center gap-1.5 justify-center">
                  <span className={`font-bold text-[9px] ${result.iconClass}`}>
                    {result.icon}
                  </span>
                  <Badge
                    variant="outline"
                    className={`rounded font-mono text-[7px] px-2 py-0.5 tracking-widest border transition-all duration-300 ${result.badge}`}
                  >
                    {result.label}
                  </Badge>
                </div>

                <span className="font-mono text-[7px] text-zinc-500 uppercase text-right whitespace-nowrap">
                  {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                </span>

                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(match.pgn, match.id)}
                    className="h-6 w-6 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 rounded border border-transparent hover:border-white/10 transition-all duration-200"
                    title="Copy PGN"
                  >
                    {copiedId === match.id ? (
                      <Check className="h-3 w-3 text-emerald-400" />
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
