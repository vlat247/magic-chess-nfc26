'use client'

/**
 * MultiplayerGameBoard — wraps the existing react-chessboard with multiplayer logic.
 * - Blocks moves when it's not the player's turn
 * - Flips board based on playerColor
 * - Shows "Opponent's Turn" overlay when waiting
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { useMultiplayerStore } from '@/store/multiplayer-store'
import { ChessEngineService } from '@/engine/chess-engine'

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false }
)

interface MultiplayerGameBoardProps {
  onMove: (from: string, to: string, promotion?: string) => boolean
  isMyTurn: boolean
}

export function MultiplayerGameBoard({ onMove, isMyTurn }: MultiplayerGameBoardProps) {
  const fen = useMultiplayerStore((s) => s.fen)
  const playerColor = useMultiplayerStore((s) => s.playerColor)
  const isCheckmate = useMultiplayerStore((s) => s.isCheckmate)
  const isStalemate = useMultiplayerStore((s) => s.isStalemate)
  const isDraw = useMultiplayerStore((s) => s.isDraw)

  const { profile } = useAuth()
  const boardSkin = profile?.board_skin ?? 'classic'
  const pieceSkin = profile?.piece_skin ?? 'classic'

  // Helper to render runic pieces
  const renderRunePiece = useCallback((piece: string, squareWidth: number) => {
    const runicSymbols: Record<string, string> = {
      wK: 'ᛟ', bK: 'ᛟ',
      wQ: 'ᛗ', bQ: 'ᛗ',
      wR: 'ᚱ', bR: 'ᚱ',
      wN: 'ᚦ', bN: 'ᚦ',
      wB: 'ᛋ', bB: 'ᛋ',
      wP: 'ᛏ', bP: 'ᛏ'
    }
    const isWhite = piece[0] === 'w'
    const color = isWhite ? 'oklch(0.8 0.18 85)' : 'oklch(0.7 0.2 195)'
    const symbol = runicSymbols[piece] || '✦'
    
    return (
      <div 
        className="flex items-center justify-center rounded-full border-2 select-none"
        style={{ 
          width: squareWidth * 0.75, 
          height: squareWidth * 0.75, 
          borderColor: color,
          background: 'oklch(0.08 0.02 280 / 0.95)',
          boxShadow: `0 0 8px ${color}, inset 0 0 4px ${color}`,
          margin: 'auto',
        }}
      >
        <span 
          style={{ 
            color, 
            fontSize: squareWidth * 0.38, 
            fontWeight: 'bold',
            textShadow: `0 0 6px ${color}`
          }}
        >
          {symbol}
        </span>
      </div>
    )
  }, [])

  const boardStyles = useMemo(() => {
    switch (boardSkin) {
      case 'neon-abyss':
        return {
          light: { backgroundColor: "oklch(0.2 0.05 300)", boxShadow: "inset 0 0 12px oklch(0.7 0.25 300 / 0.3)" },
          dark: { backgroundColor: "oklch(0.1 0.02 280)" },
          borderClass: 'border-neon-purple shadow-[0_0_20px_oklch(0.7_0.25_300/0.4)]'
        }
      case 'molten-core':
        return {
          light: { backgroundColor: "oklch(0.85 0.15 70)", boxShadow: "inset 0 0 12px oklch(0.8 0.18 85 / 0.4)" },
          dark: { backgroundColor: "oklch(0.2 0.05 25)" },
          borderClass: 'border-neon-gold shadow-[0_0_20px_oklch(0.8_0.18_85/0.4)]'
        }
      case 'cosmic-void':
        return {
          light: { backgroundColor: "oklch(0.15 0.05 240)", boxShadow: "inset 0 0 12px oklch(0.6 0.2 240 / 0.4)" },
          dark: { backgroundColor: "oklch(0.08 0.02 240)" },
          borderClass: 'border-neon-cyan shadow-[0_0_20px_oklch(0.7_0.2_195/0.4)]'
        }
      case 'classic':
      default:
        return {
          light: { backgroundColor: "oklch(0.86 0.06 280)", boxShadow: "inset 0 0 10px oklch(0.7 0.15 280 / 0.15)" },
          dark: { backgroundColor: "oklch(0.46 0.13 280)" },
          borderClass: 'border-neon-purple shadow-[0_0_20px_oklch(0.7_0.25_300/0.3)]'
        }
    }
  }, [boardSkin])

  const customPiecesMap = useMemo(() => {
    if (pieceSkin !== 'arcane-runes') return undefined
    
    const map: Record<string, any> = {}
    const pieces = ['wK', 'bK', 'wQ', 'bQ', 'wR', 'bR', 'wN', 'bN', 'wB', 'bB', 'wP', 'bP']
    pieces.forEach(p => {
      map[p] = ({ squareWidth }: { squareWidth: number }) => renderRunePiece(p, squareWidth)
    })
    return map
  }, [pieceSkin, renderRunePiece])

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [optionSquares, setOptionSquares] = useState<string[]>([])
  const [boardWidth, setBoardWidth] = useState(480)

  const boardOrientation = playerColor === 'black' ? 'black' : 'white'
  const gameOver = isCheckmate || isStalemate || isDraw
  const canMove = isMyTurn && !gameOver

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 480) setBoardWidth(w - 32)
      else if (w < 768) setBoardWidth(380)
      else if (w < 1024) setBoardWidth(440)
      else setBoardWidth(500)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const highlightMoves = useCallback(
    (square: string) => {
      const moves = ChessEngineService.getPossibleMoves(fen, square)
      if (!moves.length) { setOptionSquares([]); return false }
      setOptionSquares(moves.map((m) => m.to))
      return true
    },
    [fen]
  )

  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (!canMove) return
      if (selectedSquare === square) { setSelectedSquare(null); setOptionSquares([]); return }
      if (selectedSquare && optionSquares.includes(square)) {
        const success = onMove(selectedSquare, square)
        if (success) { setSelectedSquare(null); setOptionSquares([]); return }
      }
      const hasMoves = highlightMoves(square)
      if (hasMoves) setSelectedSquare(square)
      else { setSelectedSquare(null); setOptionSquares([]) }
    },
    [canMove, selectedSquare, optionSquares, onMove, highlightMoves]
  )

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean => {
      if (!canMove || !targetSquare) return false
      const success = onMove(sourceSquare, targetSquare)
      setSelectedSquare(null)
      setOptionSquares([])
      return success
    },
    [canMove, onMove]
  )

  const boardSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}
    if (selectedSquare) {
      styles[selectedSquare] = { background: 'rgba(168, 85, 247, 0.4)', boxShadow: 'inset 0 0 12px var(--neon-purple)' }
    }
    optionSquares.forEach((sq) => {
      styles[sq] = { background: 'radial-gradient(circle, rgba(34, 211, 238, 0.75) 24%, transparent 26%)', cursor: 'pointer' }
    })
    return styles
  }, [selectedSquare, optionSquares])

  return (
    <div className="relative flex items-center justify-center">
      <div 
        className={cn(
          "pixel-border p-2 bg-[oklch(0.08_0.02_280)] transition-all duration-300",
          boardStyles.borderClass,
          pieceSkin === 'hologram' && 'hologram-pieces'
        )}
        style={{ width: boardWidth + 16 }}
      >
        <div className="relative border-4 border-[oklch(0.2_0.04_280)] bg-black">
          <Chessboard
            key={`${fen}-${boardOrientation}`}
            options={{
              position: fen,
              boardOrientation,
              onPieceDrop,
              onSquareClick,
              lightSquareStyle: boardStyles.light,
              darkSquareStyle: boardStyles.dark,
              customPieces: customPiecesMap,
              squareStyles: boardSquareStyles,
              animationDurationInMs: 200,
              allowDragging: canMove,
            }}
          />

          {/* Opponent's turn overlay */}
          {!isMyTurn && !gameOver && (
            <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-4 z-10 pointer-events-none">
              <span className="font-mono text-[9px] tracking-widest text-neon-cyan/80 animate-pulse bg-black/60 px-3 py-1">
                AWAITING OPPONENT MOVE...
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute -bottom-6 text-[9px] text-muted-foreground tracking-widest font-mono select-none">
        {playerColor ? `PLAYING AS ${playerColor.toUpperCase()}` : 'ARCANE BOARD'}
      </div>
    </div>
  )
}
