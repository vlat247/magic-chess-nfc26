'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as UiTable, TableBody as UiTableBody, TableCell as UiTableCell, TableHead as UiTableHead, TableHeader as UiTableHeader, TableRow as UiTableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, ShieldAlert, ShieldCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Match {
  id: string
  opponent_name: string | null
  pgn: string
  winner: string | null // 'white', 'black', 'draw'
  mode: string // 'pvp', 'ai'
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
        label: 'DRAW STASIS', 
        color: 'text-muted-foreground border-muted-foreground/30 bg-muted/5',
        glow: '' 
      }
    }
    
    // Assume user is White for simplicity
    const userWon = match.winner === 'white'
    
    if (userWon) {
      return { 
        label: 'VICTORY', 
        color: 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/8 font-bold',
        glow: 'shadow-[0_0_12px_oklch(0.7_0.2_195/0.25)] border-neon-cyan/50' 
      }
    } else {
      return { 
        label: 'DEFEAT', 
        color: 'text-neon-pink border-neon-pink/40 bg-neon-pink/8 font-bold',
        glow: 'shadow-[0_0_12px_oklch(0.7_0.22_330/0.25)] border-neon-pink/50' 
      }
    }
  }

  if (matches.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 rounded-none border border-border bg-card/20 text-center relative"
      >
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/30" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-muted-foreground/30" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-muted-foreground/30" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/30" />
        
        <ShieldAlert className="h-6 w-6 text-muted-foreground/60 mb-2 animate-pulse" />
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">No duels fought in this cycle</p>
        <p className="font-mono text-[8px] text-muted-foreground/50 uppercase mt-1">Step onto the board to cast your first checkmate</p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-border/80 bg-gradient-to-b from-card/30 to-background/60 backdrop-blur-md overflow-hidden relative"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
    >
      {/* Corner indicators */}
      <div className="absolute top-0 left-0 w-1 h-1 bg-border" />
      <div className="absolute top-0 right-0 w-1 h-1 bg-border" />
      <div className="absolute bottom-0 left-0 w-1 h-1 bg-border" />
      <div className="absolute bottom-0 right-0 w-1 h-1 bg-border" />

      <UiTable className="font-mono text-[9px] tracking-widest">
        <UiTableHeader className="bg-black/30 border-b border-border/50">
          <UiTableRow className="border-border/40 hover:bg-transparent uppercase">
            <UiTableHead className="text-muted-foreground/80 h-10 px-4">Mode</UiTableHead>
            <UiTableHead className="text-muted-foreground/80 h-10 px-4">Opponent</UiTableHead>
            <UiTableHead className="text-muted-foreground/80 h-10 px-4">Result</UiTableHead>
            <UiTableHead className="text-muted-foreground/80 h-10 px-4">Fought</UiTableHead>
            <UiTableHead className="text-muted-foreground/80 h-10 px-4 text-right">Actions</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <AnimatePresence>
            {matches.map((match, idx) => {
              const result = getMatchResult(match)
              return (
                <motion.tr
                  key={match.id}
                  custom={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="border-b border-border/30 hover:bg-white/[0.02] transition-colors duration-200 group"
                >
                  <UiTableCell className="px-4 py-3">
                    <Badge variant="outline" className="border-neon-purple/20 bg-neon-purple/5 text-neon-purple rounded-none font-bold text-[8px] px-1.5 py-0.5 tracking-wider">
                      {match.mode === 'ai' ? 'VS COGNITIVE ENGINE' : 'ARCANE PVP'}
                    </Badge>
                  </UiTableCell>
                  <UiTableCell className="text-foreground/90 font-bold px-4 py-3">
                    {match.opponent_name || (match.mode === 'ai' ? 'Stockfish AI' : 'Unknown Mage')}
                  </UiTableCell>
                  <UiTableCell className="px-4 py-3">
                    <Badge variant="outline" className={`rounded-none text-[8px] px-2 py-0.5 tracking-widest transition-all duration-300 ${result.color} ${result.glow}`}>
                      {result.label}
                    </Badge>
                  </UiTableCell>
                  <UiTableCell className="text-muted-foreground/60 text-[8px] px-4 py-3 uppercase">
                    {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                  </UiTableCell>
                  <UiTableCell className="text-right px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(match.pgn, match.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-none border border-transparent hover:border-border/40 transition-all duration-200"
                        title="Extract PGN runes"
                      >
                        {copiedId === match.id ? (
                          <Check className="h-3 w-3 text-neon-cyan animate-pulse" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </UiTableCell>
                </motion.tr>
              )
            })}
          </AnimatePresence>
        </UiTableBody>
      </UiTable>
    </motion.div>
  )
}
