"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useGame } from "../../hooks/use-game"

// Dynamically import Chessboard from react-chessboard to prevent Next.js SSR crashes
// since react-chessboard accesses window and document for drag-and-drop.
const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
)

export function GameBoard() {
  const { fen, makeMove, getPossibleMoves, turn, isCheckmate, isStalemate, isDraw } = useGame()
  
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

  // Highlight possible moves for the selected square
  const highlightPossibleMoves = (square: string) => {
    const moves = getPossibleMoves(square)
    if (moves.length === 0) {
      setOptionSquares([])
      return false
    }

    const targetSquares = moves.map((m) => m.to)
    setOptionSquares(targetSquares)
    return true
  }

  // Click on a square
  const onSquareClick = ({ square }: { square: string }) => {
    // If game is over, freeze interactions
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
  }

  // Drag and drop handler
  const onPieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string }): boolean => {
    if (isCheckmate || isStalemate || isDraw) return false
    
    const success = makeMove(sourceSquare, targetSquare)
    
    // Clear highlights on drop
    setSelectedSquare(null)
    setOptionSquares([])
    
    return success
  }

  // Generate styles for highlighting selected squares and moves options
  const getCustomSquareStyles = () => {
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
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Board Decorative Frame */}
      <div 
        className="pixel-border glow-purple p-2 bg-[oklch(0.08_0.02_280)] transition-all duration-300"
        style={{ width: boardWidth + 16 }}
      >
        <div className="relative border-4 border-[oklch(0.2_0.04_280)]">
          {/* Renders the actual Chessboard */}
          <Chessboard
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
              squareStyles: getCustomSquareStyles(),
              animationDurationInMs: 250,
              allowDragging: true,
              boardOrientation: "white"
            }}
          />
        </div>
      </div>

      {/* Subtle indicator of current spell grid overlay under the board */}
      <div className="absolute -bottom-8 text-[9px] text-muted-foreground tracking-widest font-mono">
        ARCANE BOARD CALIBRATED
      </div>
    </div>
  )
}
