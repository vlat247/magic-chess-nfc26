"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Undo2, RotateCcw, Home } from "lucide-react"
import { useGameStore } from "../../store/game-store"

/**
 * Performance-optimized GameControls component.
 * Uses fine-grained selectors (e.g. tracking a boolean history flag) to avoid
 * re-drawing button matrices when regular turns take place.
 */
export function GameControls() {
  const undoMove = useGameStore((state) => state.undoMove)
  const resetGame = useGameStore((state) => state.resetGame)
  // Subscribes to a simple boolean flag derived from history length.
  // This shields the controls from rerendering on every single move, only updating when the match begins/ends.
  const isUndoDisabled = useGameStore((state) => state.history.length === 0)
  
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  // Autoreset the reset confirmation state after 3 seconds of inactivity
  useEffect(() => {
    if (!showConfirmReset) return

    const timer = setTimeout(() => {
      setShowConfirmReset(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showConfirmReset])

  const handleResetClick = () => {
    if (showConfirmReset) {
      resetGame()
      setShowConfirmReset(false)
    } else {
      setShowConfirmReset(true)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Actions Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Undo Button */}
        <button
          onClick={undoMove}
          disabled={isUndoDisabled}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-xs md:text-sm font-mono tracking-wider transition-all duration-200 select-none cursor-pointer border-2
            ${
              isUndoDisabled
                ? "border-muted text-muted-foreground opacity-40 cursor-not-allowed bg-transparent"
                : "border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 hover:scale-[1.03] active:scale-[0.98] glow-cyan hover:text-white"
            }
          `}
          style={{
            boxShadow: !isUndoDisabled 
              ? "0 0 10px oklch(0.7 0.2 195 / 0.3), inset 0 0 5px oklch(0.7 0.2 195 / 0.1)" 
              : "none",
          }}
        >
          <Undo2 size={16} className={isUndoDisabled ? "" : "animate-pulse"} />
          UNDO MOVE
        </button>

        {/* Reset Button with Safe Confirmation State */}
        <button
          onClick={handleResetClick}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-xs md:text-sm font-mono tracking-wider transition-all duration-200 select-none cursor-pointer border-2
            ${
              showConfirmReset
                ? "border-destructive text-destructive bg-destructive/10 animate-pulse hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                : "border-neon-gold text-neon-gold hover:bg-neon-gold/10 hover:scale-[1.03] active:scale-[0.98] glow-gold hover:text-white"
            }
          `}
          style={{
            boxShadow: showConfirmReset
              ? "0 0 15px oklch(0.57 0.24 27 / 0.5)"
              : "0 0 10px oklch(0.8 0.18 85 / 0.3), inset 0 0 5px oklch(0.8 0.18 85 / 0.1)",
          }}
        >
          <RotateCcw size={16} className={showConfirmReset ? "animate-spin" : ""} />
          {showConfirmReset ? "CONFIRM RESET?" : "RESET GAME"}
        </button>
      </div>

      {/* Return to Menu Button */}
      <Link href="/" passHref className="w-full">
        <div
          className="flex items-center justify-center gap-2 w-full py-4 px-4 border-2 border-neon-purple text-neon-purple hover:bg-neon-purple/10 text-xs md:text-sm font-mono tracking-widest transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] glow-purple hover:text-white select-none cursor-pointer"
          style={{
            boxShadow: "0 0 10px oklch(0.7 0.25 300 / 0.3), inset 0 0 5px oklch(0.7 0.25 300 / 0.1)",
          }}
        >
          <Home size={16} />
          LEAVE BATTLEFIELD
        </div>
      </Link>
    </div>
  )
}
