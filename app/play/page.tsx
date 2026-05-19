"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useGameStore } from "@/store/game-store"
import { GameBoard } from "@/components/arcane-chess/game-board"
import { GameControls } from "@/components/arcane-chess/game-controls"
import { MoveHistory } from "@/components/arcane-chess/move-history"
import { GameStatus } from "@/components/arcane-chess/game-status"
import { MagicParticles } from "@/components/arcane-chess/magic-particles"
import { Header } from "@/components/arcane-chess/header"
import { SpellPanel } from "@/components/arcane-chess/spell-panel"
import { getAllGameModes, getGameMode } from "@/engine/modes/registry"
import { GameAnalysisDashboard } from "@/components/arcane-chess/game-analysis-dashboard"

export default function PlayChessPage() {
  const isHydrated = useGameStore((state) => state.isHydrated)
  const setAiLevel = useGameStore((state) => state.setAiLevel)
  const gameModeId = useGameStore((state) => state.gameModeId)
  const setGameMode = useGameStore((state) => state.setGameMode)
  const history = useGameStore((state) => state.history)

  // Local spell selection coordinate state
  const [activeSpell, setActiveSpell] = useState<string | null>(null)
  
  // Transition state to show post-game analysis dashboard
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Pick up AI level set from the lobby hub
  useEffect(() => {
    if (!isHydrated) return
    const stored = sessionStorage.getItem("chess_ai_level") as
      | "none" | "easy" | "medium" | "hard"
      | null
    if (stored) {
      setAiLevel(stored)
      sessionStorage.removeItem("chess_ai_level")
    }
  }, [isHydrated, setAiLevel])

  // Reset analysis view if the board has been reset/restarted
  useEffect(() => {
    if (history.length === 0) {
      setIsAnalyzing(false)
    }
  }, [history])

  if (!isHydrated) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[oklch(0.08_0.02_280)] to-[oklch(0.15_0.06_300)] overflow-hidden">
        <MagicParticles />
        <div
          className="absolute inset-0 opacity-10 animate-grid pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute inset-0 pointer-events-none opacity-35 animate-scanlines mix-blend-overlay z-0" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,5,25,0.95)_100%)] z-0" />
        <div className="relative z-10 flex flex-col items-center select-none">
          <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-dashed border-neon-gold rounded-full animate-spin" style={{ animationDuration: "12s" }} />
          <div className="absolute top-2 left-2 w-20 h-20 md:w-28 md:h-28 border-2 border-dotted border-neon-purple rounded-full animate-spin-reverse" style={{ animationDuration: "8s" }} />
          <div className="absolute top-6 left-6 w-12 h-12 md:w-20 md:h-20 border border-double border-neon-cyan rounded-full animate-pulse" />
          <p className="mt-8 text-xs font-mono font-bold tracking-widest text-neon-gold text-glow-gold animate-pulse">
            CONJURING BATTLEFIELD...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)] overflow-x-hidden pt-24 pb-8 px-4 flex flex-col items-center justify-start">
      <Header />
      <MagicParticles />

      <div
        className="absolute inset-0 opacity-10 animate-grid pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-30 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,25,0.95)_100%)] shadow-[inset_0_0_150px_rgba(0,0,0,1)] z-0" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6 md:gap-8 items-center">

        {/* Title & Game Mode Selector */}
        <header className="text-center flex flex-col items-center select-none">
          <Link href="/profile">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-title text-glow-gold text-neon-gold select-none cursor-pointer tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              CHESS & MAGIC
            </h1>
          </Link>
          <div className="mt-1 h-0.5 w-24 bg-neon-purple glow-purple animate-pulse" />
          
          {/* Arcane Mode Selector Dropdown */}
          <div className="mt-5 flex flex-wrap gap-2.5 bg-[oklch(0.085_0.02_280)] p-1.5 border border-[oklch(0.2_0.04_280)] relative z-30">
            {getAllGameModes().map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setGameMode(mode.id as any)
                  setActiveSpell(null) // Cancel any active targeting on switch
                  setIsAnalyzing(false) // Exit analysis if mode changes
                }}
                className={`px-3 py-1.5 font-mono text-[9px] tracking-widest transition-all uppercase rounded-sm border ${
                  gameModeId === mode.id
                    ? "bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.35)]"
                    : "text-muted-foreground border-transparent hover:bg-white/5"
                }`}
                title={mode.description}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </header>

        {/* Game layout */}
        {isAnalyzing ? (
          <GameAnalysisDashboard 
            history={history}
            startingFen={getGameMode(gameModeId).setupBoard()}
            onClose={() => setIsAnalyzing(false)}
          />
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center animate-fade-in">

            {/* Board */}
            <div className="lg:col-span-7 flex justify-center w-full">
              <GameBoard 
                activeSpell={activeSpell} 
                onClearActiveSpell={() => setActiveSpell(null)} 
              />
            </div>

            {/* Sidebar Panel */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full max-w-[480px] mx-auto lg:max-w-none">
              {/* Dynamic Spell Grimoire UI */}
              {gameModeId === "spell" && (
                <SpellPanel 
                  activeSpell={activeSpell} 
                  onSelectSpell={setActiveSpell} 
                />
              )}
              <GameStatus onAnalyze={() => setIsAnalyzing(true)} />
              <MoveHistory />
              <GameControls />
            </div>

          </div>
        )}
      </div>
    </main>
  )
}
