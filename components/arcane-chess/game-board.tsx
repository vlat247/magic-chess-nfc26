"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { cn } from "../../lib/utils"
import dynamic from "next/dynamic"
import { useGameStore } from "../../store/game-store"
import { useChessAI } from "../../hooks/use-chess-ai"
import { useAuth } from "../../hooks/use-auth"
import { saveMatch } from "../../actions/matches"
import { getGameMode } from "../../engine/modes/registry"
import { Chess } from "chess.js"
import { motion, AnimatePresence } from "framer-motion"

const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
)

interface GameBoardProps {
  activeSpell?: string | null
  onClearActiveSpell?: () => void
}

/**
 * Performance-optimized and feature-packed GameBoard component.
 * Integrates modular Chaos Mode targeting overlays, persistent particle tiles,
 * and high-impact spellcasting animations using Framer Motion.
 */
export function GameBoard({ activeSpell, onClearActiveSpell }: GameBoardProps) {
  // Select Zustand store states
  const fen = useGameStore((state) => state.fen)
  const makeMove = useGameStore((state) => state.makeMove)
  const getPossibleMoves = useGameStore((state) => state.getPossibleMoves)
  const isCheckmate = useGameStore((state) => state.isCheckmate)
  const isStalemate = useGameStore((state) => state.isStalemate)
  const isDraw = useGameStore((state) => state.isDraw)
  const aiLevel = useGameStore((state) => state.aiLevel)
  const setAiLevel = useGameStore((state) => state.setAiLevel)
  const isThinking = useGameStore((state) => state.isThinking)
  const evaluation = useGameStore((state) => state.evaluation)
  const history = useGameStore((state) => state.history)
  const winner = useGameStore((state) => state.winner)
  const gameModeId = useGameStore((state) => state.gameModeId)
  const chaosState = useGameStore((state) => state.chaosState)
  const castSpell = useGameStore((state) => state.castSpell)
  const turn = useGameStore((state) => state.turn)

  const { user, profile } = useAuth()

  const boardSkin = profile?.board_skin ?? 'classic'
  const pieceSkin = profile?.piece_skin ?? 'classic'
  const spellEffect = profile?.spell_effect ?? 'classic'

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
  const [hasSavedMatch, setHasSavedMatch] = useState(false)

  // Initialize AI hook
  useChessAI()

  // Reset saved match state if game is restarted/reset
  useEffect(() => {
    if (history.length === 0) {
      setHasSavedMatch(false)
    }
  }, [history])

  // Auto-save match when game concludes
  useEffect(() => {
    const checkAndSaveMatch = async () => {
      const isGameOver = isCheckmate || isStalemate || isDraw
      if (isGameOver && !hasSavedMatch && user) {
        setHasSavedMatch(true)
        try {
          let pgnString = ""
          for (let i = 0; i < history.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1
            const whiteMove = history[i]
            const blackMove = history[i + 1] ? ` ${history[i + 1]}` : ""
            pgnString += `${moveNum}. ${whiteMove}${blackMove} `
          }
          pgnString = pgnString.trim()

          const opponentName = aiLevel !== "none" ? `Stockfish AI (${aiLevel})` : "Local Spellcaster"
          const matchMode = aiLevel !== "none" ? "ai" : "pvp"
          const matchWinner = isDraw || isStalemate ? "draw" : (winner === "w" ? "white" : "black")

          await saveMatch({
            opponentName,
            pgn: pgnString || "1. e4 e5",
            winner: matchWinner,
            mode: matchMode,
          })
          console.log("Match successfully saved to Supabase.")
        } catch (err) {
          console.error("Failed to auto-save completed match:", err)
          setHasSavedMatch(false)
        }
      }
    }

    checkAndSaveMatch()
  }, [isCheckmate, isStalemate, isDraw, hasSavedMatch, user, history, aiLevel, winner])

  
  // Local interaction states
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [optionSquares, setOptionSquares] = useState<string[]>([])
  const [boardWidth, setBoardWidth] = useState(480)

  // Active spell cast animation state
  const [lastCast, setLastCast] = useState<{ spellId: string; square: string; id: number } | null>(null)

  // Clear animation after duration
  useEffect(() => {
    if (lastCast) {
      const timer = setTimeout(() => {
        setLastCast(null)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [lastCast])

  // Responsive board sizing
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 480) {
        setBoardWidth(width - 32)
      } else if (width < 768) {
        setBoardWidth(420)
      } else if (width < 1024) {
        setBoardWidth(480)
      } else {
        setBoardWidth(520)
      }
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Highlight possible moves
  const highlightPossibleMoves = useCallback(
    (square: string) => {
      const moves = getPossibleMoves(square)
      if (moves.length === 0) {
        setOptionSquares([])
        return false
      }
      setOptionSquares(moves.map((m) => m.to))
      return true
    },
    [getPossibleMoves]
  )

  // Click on a square
  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (isCheckmate || isStalemate || isDraw) return

      // ── CHAOS SPELL TARGETING INTERCEPT ───────────────────────────────────
      if (activeSpell) {
        const success = castSpell(activeSpell, square)
        if (success) {
          // Store last cast coordinates to fire Framer Motion animations
          setLastCast({ spellId: activeSpell, square, id: Math.random() })
          onClearActiveSpell?.()
        } else {
          // Play failed cast haptic sound or console trigger
          console.warn("Invalid target for spell cast.")
        }
        return
      }

      if (selectedSquare === square) {
        setSelectedSquare(null)
        setOptionSquares([])
        return
      }

      if (selectedSquare && optionSquares.includes(square)) {
        const success = makeMove(selectedSquare, square)
        if (success) {
          setSelectedSquare(null)
          setOptionSquares([])
          return
        }
      }

      const hasMoves = highlightPossibleMoves(square)
      if (hasMoves) {
        setSelectedSquare(square)
      } else {
        setSelectedSquare(null)
        setOptionSquares([])
      }
    },
    [selectedSquare, optionSquares, isCheckmate, isStalemate, isDraw, activeSpell, castSpell, makeMove, highlightPossibleMoves, onClearActiveSpell]
  )

  // Drop piece
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean => {
      if (isCheckmate || isStalemate || isDraw || !targetSquare || activeSpell) return false
      
      const success = makeMove(sourceSquare, targetSquare)
      setSelectedSquare(null)
      setOptionSquares([])
      return success
    },
    [isCheckmate, isStalemate, isDraw, makeMove, activeSpell]
  )

  // Dynamic targeting & movement styles
  const boardSquareStyles = useMemo(() => {
    const styles: Record<string, any> = {}

    // Highlight selected piece
    if (selectedSquare) {
      styles[selectedSquare] = {
        background: "rgba(168, 85, 247, 0.35)",
        boxShadow: "inset 0 0 12px var(--neon-purple)",
      }
    }

    // Highlight valid standard moves (cyan arcane marks)
    optionSquares.forEach((square) => {
      styles[square] = {
        background: "radial-gradient(circle, rgba(34, 211, 238, 0.7) 22%, transparent 24%)",
        cursor: "pointer",
      }
    })

    // ── SPELL TARGETING ARCANE LIGHTS ────────────────────────────────────
    if (activeSpell && gameModeId === "spell" && chaosState) {
      const activeMode = getGameMode("spell") as any
      const spell = activeMode.spells?.find((s: any) => s.id === activeSpell)
      
      if (spell) {
        const chessSquares = [
          "a8","b8","c8","d8","e8","f8","g8","h8",
          "a7","b7","c7","d7","e7","f7","g7","h7",
          "a6","b6","c6","d6","e6","f6","g6","h6",
          "a5","b5","c5","d5","e5","f5","g5","h5",
          "a4","b4","c4","d4","e4","f4","g4","h4",
          "a3","b3","c3","d3","e3","f3","g3","h3",
          "a2","b2","c2","d2","e2","f2","g2","h2",
          "a1","b1","c1","d1","e1","f1","g1","h1"
        ]

        chessSquares.forEach((sq) => {
          const validation = spell.validateCast(fen, sq, turn, chaosState)
          if (validation.valid) {
            styles[sq] = {
              background: "radial-gradient(circle, rgba(239, 68, 68, 0.45) 25%, transparent 27%)",
              cursor: "crosshair",
              boxShadow: "inset 0 0 6px rgba(239, 68, 68, 0.15)",
            }
          }
        })
      }
    }

    return styles
  }, [selectedSquare, optionSquares, activeSpell, gameModeId, chaosState, fen, turn])

  // math engine to map chess square index to absolute DOM grid positions
  const getSquareOffset = useCallback(
    (square: string) => {
      const file = square.charCodeAt(0) - 97 // a=0, h=7
      const rank = 8 - parseInt(square[1]) // 8=0, 1=7
      const tileSize = boardWidth / 8
      return {
        left: file * tileSize,
        top: rank * tileSize,
        size: tileSize,
      }
    },
    [boardWidth]
  )

  const evalPercentage = useMemo(() => {
    const clamped = Math.max(-10, Math.min(10, evaluation))
    return 50 + (clamped / 10) * 50
  }, [evaluation])

  // Get active spell grids from Zustand
  const frozenGrids = useMemo(() => {
    if (gameModeId !== "spell" || !chaosState?.frozenSquares) return []
    return Object.entries(chaosState.frozenSquares)
      .filter(([_, turns]) => (turns as number) > 0)
      .map(([sq, turns]) => ({ square: sq, turns: turns as number }))
  }, [gameModeId, chaosState])

  const shieldedGrids = useMemo(() => {
    if (gameModeId !== "spell" || !chaosState?.shieldedSquares) return []
    return Object.entries(chaosState.shieldedSquares)
      .filter(([_, active]) => active === true)
      .map(([sq]) => sq)
  }, [gameModeId, chaosState])

  return (
    <div className="relative flex flex-col items-center justify-center gap-6">
      {/* Turn indicator title */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">
          Opponent Mode
        </span>
        <div className="flex gap-2 bg-[oklch(0.08_0.02_280)] p-1 border border-[oklch(0.2_0.04_280)] rounded-md">
          {(["none", "easy", "medium", "hard"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setAiLevel(level)}
              className={`px-3 py-1 font-mono text-xs tracking-wider transition-all rounded-sm ${
                aiLevel === level
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "text-muted-foreground hover:bg-white/5"
              }`}
            >
              {level === "none" ? "PvP" : `AI: ${level.toUpperCase()}`}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center gap-4">
        {/* Evaluation Bar */}
        <div className="hidden md:flex flex-col w-4 h-full border-2 border-[oklch(0.2_0.04_280)] bg-[oklch(0.15_0.04_280)] relative overflow-hidden" style={{ height: boardWidth + 16 }}>
          <div 
            className="absolute bottom-0 w-full bg-white/90 transition-all duration-700 ease-in-out"
            style={{ height: `${evalPercentage}%` }}
          />
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/50" />
          <div className="absolute top-2 w-full text-center text-[8px] font-mono font-bold text-white mix-blend-difference drop-shadow-md z-10">
            {evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1)}
          </div>
        </div>

        {/* Board Frame */}
        <div 
          className={cn(
            "pixel-border p-2 bg-[oklch(0.08_0.02_280)] transition-all duration-300",
            boardStyles.borderClass,
            pieceSkin === 'hologram' && 'hologram-pieces'
          )}
          style={{ width: boardWidth + 16 }}
        >
          <div className="relative border-4 border-[oklch(0.2_0.04_280)] bg-black">
            {/* Chessboard component */}
            <Chessboard
              key={fen}
              options={{
                position: fen,
                onPieceDrop: onPieceDrop,
                onSquareClick: onSquareClick,
                lightSquareStyle: boardStyles.light,
                darkSquareStyle: boardStyles.dark,
                pieces: customPiecesMap,
                squareStyles: boardSquareStyles,
                animationDurationInMs: 250,
                allowDragging: !activeSpell,
                boardOrientation: "white"
              }}
            />

            {/* ── PERSISTENT SPELL CELL OVERLAYS ───────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {/* Active Ice Freezes */}
              {frozenGrids.map((freeze) => {
                const offset = getSquareOffset(freeze.square)
                return (
                  <motion.div
                    key={`freeze-${freeze.square}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute border border-cyan-400/80 bg-cyan-400/10 flex items-center justify-center"
                    style={{
                      left: offset.left,
                      top: offset.top,
                      width: offset.size,
                      height: offset.size,
                      boxShadow: "inset 0 0 10px rgba(34,211,238,0.4)"
                    }}
                  >
                    {/* Floating frost snowflakes */}
                    <span className="absolute bottom-0.5 right-1 font-mono text-[7px] text-cyan-300 font-bold uppercase tracking-wider opacity-90 scale-90">
                      ❄️ {freeze.turns}
                    </span>
                    <motion.div
                      animate={{ opacity: [0.1, 0.4, 0.1] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="absolute inset-0 bg-gradient-to-tr from-cyan-400/5 to-cyan-300/15"
                    />
                    {/* Small icy corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-300" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-300" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-300" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-300" />
                  </motion.div>
                )
              })}

              {/* Active Golden Shields */}
              {shieldedGrids.map((sq) => {
                const offset = getSquareOffset(sq)
                return (
                  <motion.div
                    key={`shield-${sq}`}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute flex items-center justify-center"
                    style={{
                      left: offset.left - offset.size * 0.05,
                      top: offset.top - offset.size * 0.05,
                      width: offset.size * 1.1,
                      height: offset.size * 1.1,
                    }}
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 8px rgba(234,179,8,0.3), inset 0 0 6px rgba(234,179,8,0.2)",
                          "0 0 15px rgba(234,179,8,0.5), inset 0 0 12px rgba(234,179,8,0.3)",
                          "0 0 8px rgba(234,179,8,0.3), inset 0 0 6px rgba(234,179,8,0.2)"
                        ]
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-[90%] h-[90%] border-2 border-yellow-400/80 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                      className="absolute w-[80%] h-[80%] border border-dashed border-yellow-300/40 rounded-full"
                    />
                    <span className="absolute top-0.5 right-1 font-mono text-[7px] text-yellow-400 font-bold scale-90">
                      🛡️
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* ── FRAMER MOTION CASTING ANIMATIONS ─────────────────────────── */}
            <AnimatePresence>
              {lastCast && (() => {
                const offset = getSquareOffset(lastCast.square)
                
                // 1. FIREBALL SPELL (SOLAR BURST & PIXEL SMOKE)
                if (lastCast.spellId === "fireball") {
                  return (
                    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" key={lastCast.id}>
                      {/* Flying Pixel Fireball Projectile */}
                      <motion.div
                        initial={{
                          x: offset.left - 150,
                          y: offset.top - 150,
                          scale: 2,
                          rotate: 45,
                          opacity: 1
                        }}
                        animate={{
                          x: offset.left,
                          y: offset.top,
                          scale: 1,
                          opacity: [1, 1, 0]
                        }}
                        transition={{ duration: 0.25, ease: "easeIn" }}
                        className="absolute w-8 h-8 flex items-center justify-center"
                        style={{ width: offset.size, height: offset.size }}
                      >
                        {/* 3x3 pixel fireball core */}
                        <div className="w-4 h-4 bg-orange-600 border border-red-800 grid grid-cols-2">
                          <div className="bg-yellow-400" />
                          <div className="bg-orange-500" />
                          <div className="bg-orange-600" />
                          <div className="bg-red-500" />
                        </div>
                      </motion.div>

                      {/* Exploding Core - Expand in perfect square pixels */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0.6, 1.4, 1.6],
                          opacity: [0, 1, 0.8, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
                        className="absolute bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 border-4 border-orange-500 shadow-[0_0_20px_oklch(0.8_0.18_85/0.5)]"
                        style={{
                          left: offset.left,
                          top: offset.top,
                          width: offset.size,
                          height: offset.size,
                        }}
                      />

                      {/* Exploding Pixel Sparkles (12 particles shooting out) */}
                      {[...Array(12)].map((_, i) => {
                        const angle = (i / 12) * Math.PI * 2
                        const radius = offset.size * 1.3
                        const delay = 0.23 + (Math.random() * 0.05)
                        const pColor = i % 3 === 0 ? "bg-yellow-400" : i % 3 === 1 ? "bg-orange-500" : "bg-red-600"
                        return (
                          <motion.div
                            key={`fb-spark-${i}`}
                            initial={{
                              x: offset.left + offset.size / 2 - 3,
                              y: offset.top + offset.size / 2 - 3,
                              opacity: 0,
                              scale: 1.8,
                            }}
                            animate={{
                              x: offset.left + offset.size / 2 - 3 + Math.cos(angle) * radius,
                              y: offset.top + offset.size / 2 - 3 + Math.sin(angle) * radius,
                              opacity: [0, 1, 0],
                              scale: 0.3,
                            }}
                            transition={{ duration: 0.4, delay, ease: "easeOut" }}
                            className={`absolute w-1.5 h-1.5 rounded-none border border-black/20 ${pColor}`}
                          />
                        )
                      })}

                      {/* Rising Pixel Smoke (6 gray square blocks) */}
                      {[...Array(6)].map((_, i) => {
                        const delay = 0.25 + (i * 0.05)
                        const drift = (Math.random() - 0.5) * offset.size * 0.6
                        return (
                          <motion.div
                            key={`fb-smoke-${i}`}
                            initial={{
                              x: offset.left + offset.size / 2 - 4 + (Math.random() - 0.5) * 8,
                              y: offset.top + offset.size / 2 - 2,
                              opacity: 0,
                              scale: 1,
                            }}
                            animate={{
                              y: offset.top - 20 - (Math.random() * 15),
                              x: offset.left + offset.size / 2 - 4 + drift,
                              opacity: [0, 0.85, 0],
                              scale: [1, 1.4, 0.2],
                            }}
                            transition={{ duration: 0.55, delay, ease: "easeOut" }}
                            className="absolute w-2 h-2 rounded-none bg-zinc-700 border border-zinc-900/40"
                          />
                        )
                      })}
                    </div>
                  )
                }

                // 2. FREEZE SPELL (GLACIAL SHATTER & PIXEL ICE CRYSTALS)
                if (lastCast.spellId === "freeze") {
                  return (
                    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" key={lastCast.id}>
                      {/* Glacial Falling Icicle Projectile */}
                      <motion.div
                        initial={{
                          x: offset.left + offset.size / 2 - 4,
                          y: offset.top - 120,
                          scaleY: 2,
                          opacity: 1
                        }}
                        animate={{
                          y: offset.top + offset.size / 2 - 10,
                          scaleY: 1,
                          opacity: [1, 1, 0]
                        }}
                        transition={{ duration: 0.2, ease: "easeIn" }}
                        className="absolute w-2 h-6 bg-gradient-to-b from-cyan-200 to-cyan-500 border border-cyan-300"
                      />

                      {/* Icy Geometric Lattice Impact Glow */}
                      <motion.div
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{
                          scale: [1.8, 1, 1.05],
                          opacity: [0, 1, 0.9, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, delay: 0.15, ease: "backOut" }}
                        className="absolute border-4 border-double border-cyan-200 bg-cyan-400/20 flex items-center justify-center shadow-[0_0_25px_oklch(0.7_0.2_195/0.45)]"
                        style={{
                          left: offset.left,
                          top: offset.top,
                          width: offset.size,
                          height: offset.size,
                        }}
                      >
                        {/* Pixelated Inner Box */}
                        <div className="w-[70%] h-[70%] border-2 border-dashed border-cyan-100/50" />
                      </motion.div>

                      {/* Geometric Lattice Corner Crystals (4 pixel crystals forming a square) */}
                      {[
                        { x: -6, y: -6 }, { x: 6, y: -6 },
                        { x: -6, y: 6 }, { x: 6, y: 6 }
                      ].map((pos, i) => (
                        <motion.div
                          key={`ice-lat-${i}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 1, 0.8, 0],
                            scale: [0, 1.5, 1],
                          }}
                          transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
                          className="absolute w-2.5 h-2.5 bg-cyan-100 border border-cyan-400"
                          style={{
                            left: offset.left + offset.size / 2 + pos.x - 5,
                            top: offset.top + offset.size / 2 + pos.y - 5,
                          }}
                        />
                      ))}

                      {/* Glacial Shattering Sparkles (12 cyan pixel shards) */}
                      {[...Array(12)].map((_, i) => {
                        const angle = (i / 12) * Math.PI * 2
                        const radius = offset.size * 1.2
                        const delay = 0.18 + (Math.random() * 0.04)
                        return (
                          <motion.div
                            key={`ice-spark-${i}`}
                            initial={{
                              x: offset.left + offset.size / 2 - 3,
                              y: offset.top + offset.size / 2 - 3,
                              opacity: 0,
                              scale: 1.4,
                              rotate: 0
                            }}
                            animate={{
                              x: offset.left + offset.size / 2 - 3 + Math.cos(angle) * radius,
                              y: offset.top + offset.size / 2 - 3 + Math.sin(angle) * radius,
                              opacity: [0, 1, 0],
                              scale: 0.2,
                              rotate: [0, 180]
                            }}
                            transition={{ duration: 0.5, delay, ease: "easeOut" }}
                            className="absolute w-1.5 h-1.5 rounded-none bg-cyan-200 border border-cyan-400/50 shadow-sm"
                          />
                        )
                      })}
                    </div>
                  )
                }

                // 3. SHIELD SPELL (AEGIS SUMMONS & ORBITING GLYPHS)
                if (lastCast.spellId === "shield") {
                  return (
                    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" key={lastCast.id}>
                      {/* Descending Golden Aegis Light Pillar */}
                      <motion.div
                        initial={{
                          x: offset.left,
                          scaleY: 0,
                          opacity: 1
                        }}
                        animate={{
                          scaleY: [0, 1, 0],
                          opacity: [0.8, 1, 0]
                        }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute w-full bg-gradient-to-b from-yellow-300/30 to-yellow-500/10 border-l border-r border-yellow-400/35"
                        style={{
                          left: offset.left,
                          top: offset.top - 80,
                          width: offset.size,
                          height: offset.size + 80,
                          originY: 0
                        }}
                      />

                      {/* Glowing Aegis Golden Concentric Squares */}
                      {[0, 1, 2].map((idx) => (
                        <motion.div
                          key={`sh-ring-${idx}`}
                          initial={{ scale: 0.1, opacity: 0 }}
                          animate={{
                            scale: [0.2, 1.1, 1.25],
                            opacity: [0, 1, 0.8, 0],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
                          className="absolute border border-yellow-300 bg-yellow-400/5 shadow-[0_0_20px_oklch(0.8_0.18_85/0.3)]"
                          style={{
                            left: offset.left - offset.size * 0.125,
                            top: offset.top - offset.size * 0.125,
                            width: offset.size * 1.25,
                            height: offset.size * 1.25,
                          }}
                        />
                      ))}

                      {/* Golden Holy Cross Pixel Sparks Orbiting the target cell */}
                      {[...Array(6)].map((_, i) => {
                        const startAngle = (i / 6) * Math.PI * 2
                        const radius = offset.size * 0.42
                        return (
                          <motion.div
                            key={`sh-orbit-${i}`}
                            initial={{
                              x: offset.left + offset.size / 2 - 3 + Math.cos(startAngle) * radius,
                              y: offset.top + offset.size / 2 - 3 + Math.sin(startAngle) * radius,
                              opacity: 0,
                              scale: 1
                            }}
                            animate={{
                              x: [
                                offset.left + offset.size / 2 - 3 + Math.cos(startAngle) * radius,
                                offset.left + offset.size / 2 - 3 + Math.cos(startAngle + Math.PI) * radius,
                                offset.left + offset.size / 2 - 3 + Math.cos(startAngle + Math.PI * 2) * radius,
                              ],
                              y: [
                                offset.top + offset.size / 2 - 3 + Math.sin(startAngle) * radius,
                                offset.top + offset.size / 2 - 3 + Math.sin(startAngle + Math.PI) * radius,
                                offset.top + offset.size / 2 - 3 + Math.sin(startAngle + Math.PI * 2) * radius,
                              ],
                              opacity: [0, 1, 0.9, 0],
                              scale: [1, 1.4, 0.4]
                            }}
                            transition={{ duration: 0.65, ease: "linear" }}
                            className="absolute w-2 h-2 rounded-none bg-yellow-300 border border-yellow-500 flex items-center justify-center"
                          >
                            {/* Inner cross mark */}
                            <div className="w-[30%] h-full bg-white absolute" />
                            <div className="h-[30%] w-full bg-white absolute" />
                          </motion.div>
                        )
                      })}
                    </div>
                  )
                }

                return null
              })()}
            </AnimatePresence>

            {/* AI Thinking Overlay */}
            {isThinking && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-50 transition-opacity">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-t-purple-500 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                  <div className="absolute w-10 h-10 border-4 border-b-cyan-400 border-l-purple-500 border-t-transparent border-r-transparent rounded-full animate-spin animate-reverse shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                </div>
                <span className="mt-4 font-mono text-xs text-purple-300 tracking-widest animate-pulse drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">
                  AI THINKING...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode Calibration Indicator */}
      <div className="absolute -bottom-6 text-[9px] text-muted-foreground tracking-widest font-mono select-none">
        BOARD CALIBRATED: {gameModeId.toUpperCase()}
      </div>
    </div>
  )
}
