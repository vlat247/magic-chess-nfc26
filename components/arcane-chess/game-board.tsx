"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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

  const { user } = useAuth()
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
          className="pixel-border glow-purple p-2 bg-[oklch(0.08_0.02_280)] transition-all duration-300"
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
                lightSquareStyle: {
                  backgroundColor: "oklch(0.86 0.06 280)",
                  boxShadow: "inset 0 0 10px oklch(0.7 0.15 280 / 0.15)",
                },
                darkSquareStyle: {
                  backgroundColor: "oklch(0.46 0.13 280)",
                },
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
                
                // 1. FIREBALL EXPLOSION
                if (lastCast.spellId === "fireball") {
                  return (
                    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" key={lastCast.id}>
                      {/* Exploding core */}
                      <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{
                          scale: [1, 2.2, 2.5],
                          opacity: [1, 0.8, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="absolute rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 mix-blend-screen filter blur-[0.5px]"
                        style={{
                          left: offset.left - offset.size * 0.75,
                          top: offset.top - offset.size * 0.75,
                          width: offset.size * 2.5,
                          height: offset.size * 2.5,
                        }}
                      />
                      {/* Exploding pixel particles */}
                      {[...Array(12)].map((_, i) => {
                        const angle = (i / 12) * Math.PI * 2
                        const radius = offset.size * 1.2
                        return (
                          <motion.div
                            key={i}
                            initial={{
                              x: offset.left + offset.size / 2 - 4,
                              y: offset.top + offset.size / 2 - 4,
                              opacity: 1,
                              scale: 1.5,
                            }}
                            animate={{
                              x: offset.left + offset.size / 2 - 4 + Math.cos(angle) * radius,
                              y: offset.top + offset.size / 2 - 4 + Math.sin(angle) * radius,
                              opacity: 0,
                              scale: 0.1,
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute w-2 h-2 bg-yellow-400 shadow-[0_0_8px_#facc15]"
                          />
                        )
                      })}
                    </div>
                  )
                }

                // 2. FREEZE CRYSTAL POP
                if (lastCast.spellId === "freeze") {
                  return (
                    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" key={lastCast.id}>
                      {/* Icy implosion ring */}
                      <motion.div
                        initial={{ scale: 2.8, opacity: 0 }}
                        animate={{
                          scale: [2.5, 1, 1.1],
                          opacity: [0.3, 1, 1],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "backOut" }}
                        className="absolute border-4 border-cyan-300 bg-cyan-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                        style={{
                          left: offset.left,
                          top: offset.top,
                          width: offset.size,
                          height: offset.size,
                        }}
                      >
                        <motion.div
                          animate={{ rotate: 180 }}
                          transition={{ duration: 0.4 }}
                          className="w-[80%] h-[80%] border-2 border-dashed border-cyan-100"
                        />
                      </motion.div>
                      {/* Floating ice pixel sparks */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            x: offset.left + offset.size / 2 - 3,
                            y: offset.top + offset.size / 2 - 3,
                            opacity: 1,
                            scale: 1,
                          }}
                          animate={{
                            x: offset.left + offset.size / 2 - 3 + (Math.random() - 0.5) * offset.size * 1.5,
                            y: offset.top + offset.size / 2 - 3 + (Math.random() - 0.5) * offset.size * 1.5,
                            opacity: 0,
                            scale: 0.2,
                          }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="absolute w-1.5 h-1.5 bg-cyan-200"
                        />
                      ))}
                    </div>
                  )
                }

                // 3. SHIELD SUMMON
                if (lastCast.spellId === "shield") {
                  return (
                    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" key={lastCast.id}>
                      <motion.div
                        initial={{ scale: 0.2, opacity: 0 }}
                        animate={{
                          scale: [1, 1.3, 1.1],
                          opacity: [0.3, 1, 1],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="absolute border-2 border-yellow-300 bg-yellow-400/20 rounded-full flex items-center justify-center"
                        style={{
                          left: offset.left - offset.size * 0.05,
                          top: offset.top - offset.size * 0.05,
                          width: offset.size * 1.1,
                          height: offset.size * 1.1,
                          boxShadow: "0 0 25px rgba(253,224,71,0.5), inset 0 0 10px rgba(253,224,71,0.3)"
                        }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="w-[85%] h-[85%] border border-dashed border-yellow-200 rounded-full"
                        />
                      </motion.div>
                      {/* Golden holy cross sparks */}
                      {[...Array(6)].map((_, i) => {
                        const angle = (i / 6) * Math.PI * 2
                        return (
                          <motion.div
                            key={i}
                            initial={{
                              x: offset.left + offset.size / 2 - 3,
                              y: offset.top + offset.size / 2 - 3,
                              opacity: 1,
                              scale: 1.5
                            }}
                            animate={{
                              x: offset.left + offset.size / 2 - 3 + Math.cos(angle) * (offset.size * 0.7),
                              y: offset.top + offset.size / 2 - 3 + Math.sin(angle) * (offset.size * 0.7),
                              opacity: 0,
                              scale: 0.2
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute w-1.5 h-1.5 bg-yellow-300 rotate-45"
                          />
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
