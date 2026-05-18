"use client"

import { useEffect, useRef, useMemo } from "react"
import { ScrollText } from "lucide-react"
import { useGameStore } from "../../store/game-store"

/**
 * Performance-optimized MoveHistory component.
 * Subscribes exclusively to the history array. This shields the ledger from redraws
 * unless a new move is successfully recorded (e.g. ignoring active piece hover/selection clicks).
 */
export function MoveHistory() {
  const history = useGameStore((state) => state.history)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Autoscroll the move history ledger to the bottom when moves are performed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  // Group flat moves list into pairs: [whiteMove, blackMove?] (memoized computation)
  const movePairs = useMemo(() => {
    const pairs: { round: number; white: string; black?: string }[] = []
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        round: Math.floor(i / 2) + 1,
        white: history[i],
        black: history[i + 1],
      })
    }
    return pairs
  }, [history])

  return (
    <div 
      className="flex flex-col h-[200px] md:h-[240px] w-full bg-[oklch(0.15_0.03_280)] border-2 border-neon-cyan/55 select-none"
      style={{
        boxShadow: "0 0 15px oklch(0.7 0.2 195 / 0.15), inset 0 0 8px oklch(0.12 0.02 280 / 0.8)",
      }}
    >
      {/* Ledger Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.12_0.02_280)] border-b border-neon-cyan/20">
        <ScrollText size={14} className="text-neon-cyan" />
        <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-neon-cyan">
          MOVE LEDGER
        </span>
        <span className="ml-auto text-[8px] font-mono text-muted-foreground">
          TOTAL PLY: {history.length}
        </span>
      </div>

      {/* Moves Viewport */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 font-mono text-[10px] md:text-xs tracking-wider scrollbar-thin scrollbar-thumb-neon-cyan/20 scrollbar-track-transparent"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "oklch(0.7 0.2 195 / 0.2) transparent",
        }}
      >
        {movePairs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-[10px] italic">
            NO SPELLS CAST YET
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {movePairs.map((pair) => (
              <div 
                key={pair.round} 
                className="grid grid-cols-12 py-1 px-2 border-b border-[oklch(0.2_0.04_280)]/50 hover:bg-neon-cyan/5 transition-colors duration-150"
              >
                {/* Round Number */}
                <div className="col-span-3 text-muted-foreground font-bold">
                  {pair.round}.
                </div>
                
                {/* White Move */}
                <div className="col-span-5 text-neon-gold font-semibold">
                  {pair.white}
                </div>

                {/* Black Move */}
                <div className="col-span-4 text-neon-cyan font-semibold">
                  {pair.black || <span className="text-muted-foreground/30">• • •</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
