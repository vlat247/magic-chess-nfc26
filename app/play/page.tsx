"use client"

import Link from "next/link"
import { useGameStore } from "@/store/game-store"
import { GameBoard } from "@/components/arcane-chess/game-board"
import { GameControls } from "@/components/arcane-chess/game-controls"
import { MoveHistory } from "@/components/arcane-chess/move-history"
import { GameStatus } from "@/components/arcane-chess/game-status"
import { MagicParticles } from "@/components/arcane-chess/magic-particles"
import { Header } from "@/components/arcane-chess/header"

export default function PlayChessPage() {
  const isHydrated = useGameStore((state) => state.isHydrated)

  // High-fidelity themed Loading hydration safeties to prevent Next.js mismatches
  if (!isHydrated) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[oklch(0.08_0.02_280)] to-[oklch(0.15_0.06_300)] overflow-hidden">
        {/* Ambient particle canvas */}
        <MagicParticles />

        {/* Scanlines & Pixel Grid */}
        <div 
          className="absolute inset-0 opacity-10 animate-grid pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px"
          }}
        />
        <div className="absolute inset-0 pointer-events-none opacity-35 animate-scanlines mix-blend-overlay z-0" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,5,25,0.95)_100%)] shadow-[inset_0_0_150px_rgba(0,0,0,1)] z-0" />

        {/* Themed Spell Loading Circle */}
        <div className="relative z-10 flex flex-col items-center select-none">
          {/* Animated Spell Circle Outline */}
          <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-dashed border-neon-gold rounded-full animate-spin" style={{ animationDuration: "12s" }} />
          <div className="absolute top-2 left-2 w-20 h-20 md:w-28 md:h-28 border-2 border-dotted border-neon-purple rounded-full animate-spin-reverse" style={{ animationDuration: "8s" }} />
          <div className="absolute top-6 left-6 w-12 h-12 md:w-20 md:h-20 border border-double border-neon-cyan rounded-full animate-pulse" />
          
          {/* Pulsing loading text */}
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
      {/* Background Ambience Layering */}
      <MagicParticles />
      
      {/* Pixel grid overlay */}
      <div 
        className="absolute inset-0 opacity-10 animate-grid pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px"
        }}
      />
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 animate-scanlines mix-blend-overlay z-0" />
      
      {/* Vignette effect from sides */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,25,0.95)_100%)] shadow-[inset_0_0_150px_rgba(0,0,0,1)] z-0" />

      {/* Main Game Interface Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6 md:gap-8 items-center">
        
        {/* Title Header */}
        <header className="text-center flex flex-col items-center">
          <Link href="/">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-title text-glow-gold text-neon-gold select-none cursor-pointer tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              CHESS & MAGIC
            </h1>
          </Link>
          <div className="mt-1 h-0.5 w-24 bg-neon-purple glow-purple animate-pulse" />
          <span className="mt-2 text-[8px] md:text-[9px] font-mono tracking-widest text-neon-cyan uppercase text-glow-cyan">
            CLASSIC ARCANUM MODE
          </span>
        </header>

        {/* Primary Layout splits */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center mt-2">
          
          {/* Chessboard Column (7 / 12) */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <GameBoard />
          </div>

          {/* Controls & Statistics Column (5 / 12) */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full max-w-[480px] mx-auto lg:max-w-none">
            {/* Active turn metrics */}
            <GameStatus />

            {/* Move Ledger scrollbox */}
            <MoveHistory />

            {/* In-game controls */}
            <GameControls />
          </div>
          
        </div>

      </div>
    </main>
  )
}
