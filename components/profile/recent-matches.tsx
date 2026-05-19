'use client'

import React, { useState } from 'react'
import { Table as UiTable, TableBody as UiTableBody, TableCell as UiTableCell, TableHead as UiTableHead, TableHeader as UiTableHeader, TableRow as UiTableRow } from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Eye } from 'lucide-react'
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
  currentUserColor: 'white' | 'black' // Or determine from match data
}

export function RecentMatches({ matches, currentUserId }: RecentMatchesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getMatchResult = (match: Match) => {
    // For simplicity, let's assume the user is White in these matches.
    // In a real database, we would have white_player_id and black_player_id.
    // Here we'll check match.winner: if winner is white, it's a Win, if black, it's a Loss, etc.
    if (match.winner === 'draw') return { label: 'Draw', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
    
    // Assume user is White for simplicity
    const userWon = match.winner === 'white'
    
    if (userWon) {
      return { label: 'Victory', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    } else {
      return { label: 'Defeat', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' }
    }
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
        <p className="text-slate-400 mb-2">No duels fought yet.</p>
        <p className="text-xs text-slate-500">Step onto the board to cast your first checkmate!</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden backdrop-blur-md">
      <UiTable>
        <UiTableHeader className="bg-slate-900/40">
          <UiTableRow className="border-slate-800 hover:bg-transparent">
            <UiTableHead className="text-slate-400">Mode</UiTableHead>
            <UiTableHead className="text-slate-400">Opponent</UiTableHead>
            <UiTableHead className="text-slate-400">Result</UiTableHead>
            <UiTableHead className="text-slate-400">Fought</UiTableHead>
            <UiTableHead className="text-slate-400 text-right">Actions</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          {matches.map((match) => {
            const result = getMatchResult(match)
            return (
              <UiTableRow key={match.id} className="border-slate-800/60 hover:bg-slate-900/20">
                <UiTableCell className="font-semibold text-slate-200">
                  <Badge variant="outline" className="border-purple-500/20 bg-purple-950/10 text-purple-400">
                    {match.mode === 'ai' ? 'Vs AI Engine' : 'Spell PVP'}
                  </Badge>
                </UiTableCell>
                <UiTableCell className="text-slate-300">
                  {match.opponent_name || (match.mode === 'ai' ? 'Stockfish Engine' : 'Unknown Mage')}
                </UiTableCell>
                <UiTableCell>
                  <Badge variant="outline" className={result.color}>
                    {result.label}
                  </Badge>
                </UiTableCell>
                <UiTableCell className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                </UiTableCell>
                <UiTableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(match.pgn, match.id)}
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Copy PGN notation"
                    >
                      {copiedId === match.id ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </UiTableCell>
              </UiTableRow>
            )
          })}
        </UiTableBody>
      </UiTable>
    </div>
  )
}
