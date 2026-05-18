"use client"

import { Shield, Sparkles, Swords, Crown } from "lucide-react"
import { useGameStore } from "../../store/game-store"

/**
 * Performance-optimized GameStatus component.
 * Uses individual field selectors to subscribe exclusively to the visual turn and win/draw status triggers,
 * ensuring no redrawing occurs during general board operations (like square click hover overlays).
 */
export function GameStatus() {
  const turn = useGameStore((state) => state.turn)
  const isCheck = useGameStore((state) => state.isCheck)
  const isCheckmate = useGameStore((state) => state.isCheckmate)
  const isStalemate = useGameStore((state) => state.isStalemate)
  const isDraw = useGameStore((state) => state.isDraw)
  const winner = useGameStore((state) => state.winner)

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Game State Overlay / Status Cards */}
      {isCheckmate && (
        <div 
          className="flex flex-col items-center justify-center p-6 border-2 border-destructive bg-destructive/10 text-center animate-bounce duration-1000"
          style={{
            boxShadow: "0 0 25px oklch(0.57 0.24 27 / 0.5), inset 0 0 10px oklch(0.57 0.24 27 / 0.2)",
          }}
        >
          <Crown size={32} className="text-neon-pink mb-2 animate-pulse" />
          <h3 className="text-lg md:text-xl font-title text-destructive text-glow-purple font-bold tracking-widest">
            CHECKMATE!
          </h3>
          <p className="text-xs md:text-sm font-mono mt-2 text-foreground/90">
            {winner === "w" ? (
              <span className="text-neon-gold font-bold">LIGHT MAGICIAN (WHITE) TRIUMPHS!</span>
            ) : (
              <span className="text-neon-cyan font-bold">DARK MAGICIAN (BLACK) TRIUMPHS!</span>
            )}
          </p>
        </div>
      )}

      {(isStalemate || isDraw) && (
        <div 
          className="flex flex-col items-center justify-center p-6 border-2 border-neon-gold bg-neon-gold/10 text-center animate-pulse"
          style={{
            boxShadow: "0 0 25px oklch(0.8 0.18 85 / 0.3), inset 0 0 10px oklch(0.8 0.18 85 / 0.1)",
          }}
        >
          <Swords size={32} className="text-neon-gold mb-2" />
          <h3 className="text-lg md:text-xl font-title text-neon-gold text-glow-gold font-bold tracking-widest">
            SPELL DRAW
          </h3>
          <p className="text-xs md:text-sm font-mono mt-2 text-muted-foreground">
            {isStalemate 
              ? "STALEMATE! THE ENEMY IS LOCKED IN ARCANUM."
              : "THE BATTLEFIELD DISSOLVES IN EQUAL BOUNDS."}
          </p>
        </div>
      )}

      {isCheck && !isCheckmate && (
        <div 
          className="flex items-center gap-3 p-4 border-2 border-neon-pink bg-neon-pink/15 text-left animate-pulse"
          style={{
            boxShadow: "0 0 15px oklch(0.7 0.22 330 / 0.4), inset 0 0 5px oklch(0.7 0.22 330 / 0.1)",
          }}
        >
          <Shield size={20} className="text-neon-pink animate-bounce" />
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-neon-pink">
              KING UNDER SPELL!
            </h4>
            <p className="text-[10px] font-mono text-foreground/80 mt-0.5">
              Defend your King immediately.
            </p>
          </div>
        </div>
      )}

      {/* Standard Turn Indicator Card */}
      {!isCheckmate && !isStalemate && !isDraw && (
        <div 
          className={`flex items-center justify-between p-4 border-2 transition-all duration-300 bg-[oklch(0.15_0.03_280)]
            ${
              turn === "w"
                ? "border-neon-gold/60 shadow-[0_0_15px_oklch(0.8_0.18_85_/_0.15)]"
                : "border-neon-cyan/60 shadow-[0_0_15px_oklch(0.7_0.2_195_/_0.15)]"
            }
          `}
        >
          {/* Active Player Descriptor */}
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
              ACTIVE TURN
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Sparkles 
                size={14} 
                className={turn === "w" ? "text-neon-gold animate-spin-slow" : "text-neon-cyan animate-pulse"} 
                style={{ animationDuration: turn === "w" ? "6s" : "2s" }}
              />
              <span 
                className={`text-xs md:text-sm font-mono font-bold tracking-wider
                  ${turn === "w" ? "text-neon-gold text-glow-gold" : "text-neon-cyan text-glow-cyan"}
                `}
              >
                {turn === "w" ? "LIGHT MAGICIAN" : "DARK MAGICIAN"}
              </span>
            </div>
          </div>

          {/* Graphical turn emblem */}
          <div 
            className={`w-8 h-8 flex items-center justify-center border-2 animate-float
              ${
                turn === "w" 
                  ? "border-neon-gold bg-neon-gold/10 text-neon-gold shadow-[0_0_8px_oklch(0.8_0.18_85_/_0.3)]" 
                  : "border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-[0_0_8px_oklch(0.7_0.2_195_/_0.3)]"
              }
            `}
          >
            {turn === "w" ? "W" : "B"}
          </div>
        </div>
      )}
    </div>
  )
}
