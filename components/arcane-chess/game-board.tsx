"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useGameStore } from "../../store/game-store"
import { useChessAI } from "../../hooks/use-chess-ai"
import { useAuth } from "../../hooks/use-auth"
import { saveMatch } from "../../actions/matches"

// Dynamically import Chessboard from react-chessboard to prevent Next.js SSR crashes
// since react-chessboard accesses window and document for drag-and-drop.
const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
)

/**
 * Performance-optimized GameBoard component.
 * Uses fine-grained Zustand store subscriptions, useCallback, and useMemo to minimize
 * render calculations, resulting in lag-free, butter-smooth click and drag interactions.
 */
export function GameBoard() {
  // Select ONLY the exact game state fields required for rendering the board itself.
  // This shields the board from rerendering when unrelated states (like history or turn details) update.
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

  const { user } = useAuth()
  const [hasSavedMatch, setHasSavedMatch] = useState(false)

  // Initialize AI hook
  useChessAI()

  // Reset saved match state if game is restarted/reset (history is cleared)
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
        setHasSavedMatch(true) // prevent duplicates
        try {
          // Helper to rebuild standard PGN from SAN history
          let pgnString = ""
          for (let i = 0; i < history.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1
            const whiteMove = history[i]
            const blackMove = history[i + 1] ? ` ${history[i + 1]}` : ""
            pgnString += `${moveNum}. ${whiteMove}${blackMove} `
          }
          pgnString = pgnString.trim()

          // Map match details
          const opponentName = aiLevel !== "none" ? `Stockfish AI (${aiLevel})` : "Local Spellcaster"
          const matchMode = aiLevel !== "none" ? "ai" : "pvp"
          const matchWinner = isDraw || isStalemate ? "draw" : (winner === "w" ? "white" : "black")

          await saveMatch({
            opponentName,
            pgn: pgnString || "1. e4 e5", // Fallback if history empty
            winner: matchWinner,
            mode: matchMode,
          })
          console.log("Match successfully saved to Supabase.")
        } catch (err) {
          console.error("Failed to auto-save completed match:", err)
          setHasSavedMatch(false) // Allow retry if saving failed
        }
      }
    }

    checkAndSaveMatch()
  }, [isCheckmate, isStalemate, isDraw, hasSavedMatch, user, history, aiLevel, winner])

  
  // Local interaction states
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [optionSquares, setOptionSquares] = useState<string[]>([])
  const [boardWidth, setBoardWidth] = useState(480)

  // Responsive board sizing
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 480) {
        setBoardWidth(width - 32) // Mobile paddings
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

  // Highlight possible moves for the selected square (memoized callback)
  const highlightPossibleMoves = useCallback(
    (square: string) => {
      const moves = getPossibleMoves(square)
      if (moves.length === 0) {
        setOptionSquares([])
        return false
      }

      const targetSquares = moves.map((m) => m.to)
      setOptionSquares(targetSquares)
      return true
    },
    [getPossibleMoves]
  )

  // Click on a square (memoized callback)
  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (isCheckmate || isStalemate || isDraw) return

      // If we click the same square, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null)
        setOptionSquares([])
        return
      }

      // Try to make a move if a square was already selected and clicked square is one of the options
      if (selectedSquare && optionSquares.includes(square)) {
        const success = makeMove(selectedSquare, square)
        if (success) {
          setSelectedSquare(null)
          setOptionSquares([])
          return
        }
      }

      // Otherwise, select the new square and display its possible moves
      const hasMoves = highlightPossibleMoves(square)
      if (hasMoves) {
        setSelectedSquare(square)
      } else {
        setSelectedSquare(null)
        setOptionSquares([])
      }
    },
    [selectedSquare, optionSquares, isCheckmate, isStalemate, isDraw, makeMove, highlightPossibleMoves]
  )

  // Drag and drop handler (memoized callback)
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string }): boolean => {
      if (isCheckmate || isStalemate || isDraw) return false
      
      const success = makeMove(sourceSquare, targetSquare)
      
      // Clear highlights on drop
      setSelectedSquare(null)
      setOptionSquares([])
      
      return success
    },
    [isCheckmate, isStalemate, isDraw, makeMove]
  )

  // Generate styles for highlighting selected squares and moves options (memoized)
  const boardSquareStyles = useMemo(() => {
    const styles: Record<string, any> = {}

    // Highlight the selected square with an arcane purple spell glow
    if (selectedSquare) {
      styles[selectedSquare] = {
        background: "rgba(168, 85, 247, 0.4)",
        boxShadow: "inset 0 0 12px var(--neon-purple)",
      }
    }

    // Highlight valid moves with beautiful glowing cyan dots (arcane portal marks)
    optionSquares.forEach((square) => {
      styles[square] = {
        background: "radial-gradient(circle, rgba(34, 211, 238, 0.75) 24%, transparent 26%)",
        cursor: "pointer",
      }
    })

    return styles
  }, [selectedSquare, optionSquares])

  // Calculate evaluation bar percentage (0-100), centered at 50 for 0 eval
  // Clamped between -10 and +10 pawns
  const evalPercentage = useMemo(() => {
    const clamped = Math.max(-10, Math.min(10, evaluation))
    return 50 + (clamped / 10) * 50
  }, [evaluation])

  return (
    <div className="relative flex flex-col items-center justify-center gap-6">
      {/* AI Controls */}
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

        {/* Board Decorative Frame */}
      <div 
        className="pixel-border glow-purple p-2 bg-[oklch(0.08_0.02_280)] transition-all duration-300"
        style={{ width: boardWidth + 16 }}
      >
        <div className="relative border-4 border-[oklch(0.2_0.04_280)]">
          {/* Renders the actual Chessboard */}
          <Chessboard
            key={fen}
            options={{
              position: fen,
              onPieceDrop: onPieceDrop,
              onSquareClick: onSquareClick,
              lightSquareStyle: {
                backgroundColor: "oklch(0.25 0.08 300)",
                boxShadow: "inset 0 0 8px oklch(0.7 0.25 300 / 0.12)",
              },
              darkSquareStyle: {
                backgroundColor: "oklch(0.15 0.04 280)",
              },
              squareStyles: boardSquareStyles,
              animationDurationInMs: 250,
              allowDragging: true,
              boardOrientation: "white"
            }}
          />

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

      {/* Subtle indicator of current spell grid overlay under the board */}
      <div className="absolute -bottom-6 text-[9px] text-muted-foreground tracking-widest font-mono select-none">
        ARCANE BOARD CALIBRATED
      </div>
    </div>
  )
}
