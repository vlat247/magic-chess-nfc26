'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/arcane-chess/header'
import { Footer } from '@/components/arcane-chess/footer'
import { GlobalParticles } from '@/components/arcane-chess/global-particles'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Sparkles, Swords, Trophy, Wand2, Zap, HelpCircle, Lock, Crown, ArrowRight, Eye, Check, CheckCircle2 } from 'lucide-react'
import { FantasyPixelCard } from '@/components/ui/fantasy-pixel-card'
import { cn } from '@/lib/utils'

const featuresComparison = [
  { name: 'Access to Spell Modes', initiate: 'Basic Spells', archmage: 'All Unlocked + Future Spells', icon: Wand2, premium: false },
  { name: 'Custom Board Skins', initiate: 'Classic Wood', archmage: 'Neon Abyss, Molten Core, Cosmic Void', icon: Sparkles, premium: true },
  { name: 'Unique Piece Styles', initiate: 'Classic', archmage: 'Hologram, Arcane Runes, Wireframe', icon: Swords, premium: true },
  { name: 'Custom Spell VFX', initiate: 'Standard Sparks', archmage: 'Glacial Shatter, Void Vortex, Solar Flare', icon: Zap, premium: true },
  { name: 'Summoner ELO & Leaderboards', initiate: 'Global', initiateCheck: true, archmage: 'Global + City Leagues + Priority Badge', icon: Trophy, premium: false },
  { name: 'Advanced AI Coach', initiate: 'Limited Analysis', archmage: 'Unlimited Depth + Move Explanations', icon: ShieldCheck, premium: true },
]

export default function PremiumPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [activeCatalog, setActiveCatalog] = useState<'all' | 'boards' | 'pieces' | 'spells'>('all')

  const boards = [
    { id: 'neon-abyss', name: 'NEON ABYSS', desc: 'Cyberpunk glow square matrix grid.', colors: ['#a21caf', '#3b0764'], textColor: 'text-fuchsia-400 text-glow-purple', accentColor: '#a21caf' },
    { id: 'molten-core', name: 'MOLTEN CORE', desc: 'Fiery glowing gold and magma tiles.', colors: ['#d97706', '#451a03'], textColor: 'text-[#FACC15] text-glow-gold', accentColor: '#FACC15' },
    { id: 'cosmic-void', name: 'COSMIC VOID', desc: 'Nebula cosmic void and blue starfield.', colors: ['#0891b2', '#042f2e'], textColor: 'text-cyan-400 text-glow-cyan', accentColor: '#0891b2' },
  ]

  const pieces = [
    { id: 'arcane-runes', name: 'ARCANE RUNES', desc: 'Glowing runic symbols on slate.', symbol: 'ᛟ', textColor: 'text-[#FACC15] text-glow-gold', accentColor: '#FACC15' },
    { id: 'hologram', name: 'HOLOGRAM VECTOR', desc: 'Wireframe futuristic vector matrix.', symbol: '♞', textColor: 'text-cyan-400 text-glow-cyan', accentColor: '#0891b2' },
  ]

  const spells = [
    { id: 'glacial-spike', name: 'GLACIAL SHATTER', desc: 'Explosions of pixel fragments.', effect: '❄️', textColor: 'text-cyan-400 text-glow-cyan', accentColor: '#0891b2' },
    { id: 'void-implosion', name: 'VOID VORTEX', desc: 'Imploding micro black hole stars.', effect: '🌀', textColor: 'text-purple-400 text-glow-purple', accentColor: '#a21caf' },
    { id: 'solar-flare', name: 'SOLAR FLARE', desc: 'Eruptions of pixelated plasma fire.', effect: '🔥', textColor: 'text-orange-400', accentColor: '#f97316' },
  ]

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)] overflow-x-hidden pt-24 pb-16 px-4 flex flex-col items-center justify-start">
      <Header />
      <GlobalParticles />

      {/* Atmospheric overlays */}
      <div
        className="absolute inset-0 opacity-10 animate-grid pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-30 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,25,0.95)_100%)] shadow-[inset_0_0_150px_rgba(0,0,0,1)] z-0" />

      {/* Floating retro artifacts */}
      <div className="absolute top-1/4 left-10 w-8 h-8 border border-neon-gold/15 rotate-45 animate-float pointer-events-none z-0" />
      <div className="absolute top-1/3 right-16 w-5 h-5 bg-neon-purple/5 animate-float pointer-events-none z-0" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-6 h-6 border-2 border-neon-cyan/15 animate-float pointer-events-none z-0" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-10 mt-6">
        
        {/* ── CINEMATIC FEATURED PASS BANNER ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <FantasyPixelCard theme="gold" shimmer={true} noPadding={true}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 w-full p-6 sm:p-8 md:p-10 relative z-10">
              
              {/* Left panel: featured pass */}
              <div className="flex flex-col gap-4 max-w-xl text-center lg:text-left">
                <span className="font-mono text-[9px] text-[#FACC15] tracking-widest uppercase border border-[#FACC15]/30 bg-[#FACC15]/10 px-3 py-1.5 self-center lg:self-start flex items-center gap-1.5 font-bold animate-pulse-glow">
                  <Crown className="h-3.5 w-3.5" /> SEASON 1 CHESS PASS Active
                </span>
                <h1 
                  className="font-title text-4xl sm:text-5xl md:text-6xl text-[#FACC15] text-glow-gold tracking-wider leading-none"
                  style={{ fontFamily: 'var(--font-jacquard)' }}
                >
                  ARCHMAGE CODES UNLOCKED
                </h1>
                <p className="font-mono text-[9px] sm:text-[10px] leading-relaxed text-[#8D99AE] uppercase tracking-widest mt-1">
                  Gain access to the ultimate chess customizers. Unleash cosmic board skins, pixelated spell visuals, hologram vectors, and unlimited coach computation inside the sanctum.
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap mt-2 font-mono text-[8px] font-bold tracking-wider">
                  <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-2.5 py-1.5">
                    <Check className="h-3 w-3" /> 4 BOARD SKINSETS
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2.5 py-1.5">
                    <Check className="h-3 w-3" /> 3 PIECE STYLES
                  </div>
                  <div className="flex items-center gap-1.5 text-[#FACC15] bg-[#FACC15]/5 border border-[#FACC15]/20 px-2.5 py-1.5">
                    <Check className="h-3 w-3" /> 3 SPELLCAST VFX
                  </div>
                </div>
              </div>

              {/* Right panel: CTA Card */}
              <div className="w-full lg:w-[320px] shrink-0 border-2 border-zinc-950 bg-[#1E2530]/75 p-6 flex flex-col justify-center items-center text-center relative z-10 shadow-[4px_4px_0px_#000000]">
                {/* Corner notched pixel blocks */}
                <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#4A5568]" />
                <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#4A5568]" />
                <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-[#4A5568]" />
                <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-[#4A5568]" />
                
                <span className="font-mono text-[8px] text-[#8D99AE] tracking-widest uppercase font-bold">MONTHLY ATTUNEMENT</span>
                <div className="text-3xl font-bold font-mono text-[#FACC15] text-glow-gold mt-2">$9.99<span className="text-[10px] text-[#8D99AE] tracking-normal font-normal"> / MO</span></div>
                <p className="font-mono text-[8px] text-[#4A5568] mt-1.5 uppercase tracking-widest font-bold">Cancel anytime • Secure summoning portal</p>
                
                <div className="w-full h-[2px] bg-[#2D3748] my-4" />
                
                <Link href="/premium/checkout" className="w-full">
                  <button
                    className="w-full py-3.5 bg-[#FACC15] hover:bg-[#E2B70D] text-zinc-950 font-mono font-bold text-[10px] tracking-widest border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] transition-all uppercase cursor-pointer"
                  >
                    ENTER SECURE PORTAL <ArrowRight className="h-3.5 w-3.5 inline ml-1 align-middle" />
                  </button>
                </Link>

                <span className="font-mono text-[7px] text-[#8D99AE]/60 mt-3.5 uppercase tracking-widest font-bold">30-DAY GOLDEN GUARANTEE INCLUDED</span>
              </div>
            </div>
          </FantasyPixelCard>
        </motion.div>

        {/* ── COSMETICS & SKINS SHOPPING CATEGORIES ────────────────────────── */}
        <div className="flex flex-col gap-6">
          
          {/* Category Tabs (styled like GameModeHub/Lobby tab-bars) */}
          <div className="flex border-b-2 border-[#2D3748] bg-[#2D3748]/30 backdrop-blur-md rounded-none font-mono text-[9px] tracking-widest uppercase overflow-x-auto scrollbar-none">
            {([
              { key: 'all' as const, label: 'All Unlocks', icon: <Crown className="h-3.5 w-3.5" /> },
              { key: 'boards' as const, label: 'Board Themes', icon: <Sparkles className="h-3.5 w-3.5" /> },
              { key: 'pieces' as const, label: 'Piece Art', icon: <Swords className="h-3.5 w-3.5" /> },
              { key: 'spells' as const, label: 'Spell VFX', icon: <Wand2 className="h-3.5 w-3.5" /> },
            ]).map((tab) => {
              const isActive = activeCatalog === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCatalog(tab.key)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-300 relative uppercase rounded-none shrink-0
                    ${isActive
                      ? 'border-[#FACC15] text-[#FACC15] bg-[#FACC15]/5'
                      : 'border-transparent text-[#8D99AE] hover:text-[#BFC7D5] hover:bg-[#2D3748]/20'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              
              {/* Board Skins */}
              {(activeCatalog === 'all' || activeCatalog === 'boards') && boards.map((board) => (
                <motion.div
                  layout
                  key={board.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "p-5 border bg-[#1E2530]/40 flex flex-col justify-between min-h-[235px] relative transition-all duration-200 group rounded-none",
                    "pixel-border-gunmetal hover:pixel-border-silver hover:bg-[#1E2530]/60 shadow-[4px_4px_0px_#000000]"
                  )}
                  onMouseEnter={() => setHoveredCard(board.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Corner notched pixel blocks */}
                  <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[7px] text-[#8D99AE] uppercase tracking-widest font-bold">PREMIUM BOARD</span>
                      <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none">
                        <Lock className="h-2.5 w-2.5" /> PASS
                      </span>
                    </div>

                    <h3 className="font-mono text-[11px] font-bold mt-2 tracking-wide uppercase text-zinc-100 group-hover:text-[#BFC7D5] transition-colors">{board.name}</h3>
                    <p className="font-mono text-[8px] text-[#8D99AE] leading-normal mt-1 uppercase tracking-wider lowercase">{board.desc}</p>
                  </div>

                  {/* Micro Visual representation of board skin */}
                  <div className="w-full h-14 bg-black/40 border-2 border-[#4A5568] my-3 flex items-center justify-center gap-1.5 overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,1)_50%)] bg-[size:100%_4px]" />
                    <div className="grid grid-cols-4 gap-0.5 w-16 h-8 border border-[#4A5568]/40">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            backgroundColor: i % 2 === 0 ? board.colors[0] : board.colors[1],
                            opacity: 0.65
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <Link href="/premium/checkout">
                    <button className="w-full text-center py-2.5 bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]">
                      ACQUIRE WITH PASS
                    </button>
                  </Link>
                </motion.div>
              ))}

              {/* Piece Skins */}
              {(activeCatalog === 'all' || activeCatalog === 'pieces') && pieces.map((piece) => (
                <motion.div
                  layout
                  key={piece.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "p-5 border bg-[#1E2530]/40 flex flex-col justify-between min-h-[235px] relative transition-all duration-200 group rounded-none",
                    "pixel-border-gunmetal hover:pixel-border-silver hover:bg-[#1E2530]/60 shadow-[4px_4px_0px_#000000]"
                  )}
                  onMouseEnter={() => setHoveredCard(piece.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Corner notched pixel blocks */}
                  <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[7px] text-[#8D99AE] uppercase tracking-widest font-bold">PREMIUM PIECES</span>
                      <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none">
                        <Lock className="h-2.5 w-2.5" /> PASS
                      </span>
                    </div>

                    <h3 className="font-mono text-[11px] font-bold mt-2 tracking-wide uppercase text-zinc-100 group-hover:text-[#BFC7D5] transition-colors">{piece.name}</h3>
                    <p className="font-mono text-[8px] text-[#8D99AE] leading-normal mt-1 uppercase tracking-wider lowercase">{piece.desc}</p>
                  </div>

                  {/* Micro Visual representation of piece skin */}
                  <div className="w-full h-14 bg-black/40 border-2 border-[#4A5568] my-3 flex items-center justify-center overflow-hidden relative">
                    <span className="text-xl font-bold font-mono text-glow text-[#BFC7D5]">{piece.symbol}</span>
                  </div>

                  <Link href="/premium/checkout">
                    <button className="w-full text-center py-2.5 bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]">
                      ACQUIRE WITH PASS
                    </button>
                  </Link>
                </motion.div>
              ))}

              {/* Spell Effects */}
              {(activeCatalog === 'all' || activeCatalog === 'spells') && spells.map((spell) => (
                <motion.div
                  layout
                  key={spell.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "p-5 border bg-[#1E2530]/40 flex flex-col justify-between min-h-[235px] relative transition-all duration-200 group rounded-none",
                    "pixel-border-gunmetal hover:pixel-border-silver hover:bg-[#1E2530]/60 shadow-[4px_4px_0px_#000000]"
                  )}
                  onMouseEnter={() => setHoveredCard(spell.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Corner notched pixel blocks */}
                  <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />
                  <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-[#4A5568] group-hover:bg-[#8D99AE]/80 transition-colors z-20" />

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[7px] text-[#8D99AE] uppercase tracking-widest font-bold">PREMIUM VFX</span>
                      <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none">
                        <Lock className="h-2.5 w-2.5" /> PASS
                      </span>
                    </div>

                    <h3 className="font-mono text-[11px] font-bold mt-2 tracking-wide uppercase text-zinc-100 group-hover:text-[#BFC7D5] transition-colors">{spell.name}</h3>
                    <p className="font-mono text-[8px] text-[#8D99AE] leading-normal mt-1 uppercase tracking-wider lowercase">{spell.desc}</p>
                  </div>

                  {/* Micro Visual representation of spell VFX */}
                  <div className="w-full h-14 bg-black/40 border-2 border-[#4A5568] my-3 flex items-center justify-center overflow-hidden relative">
                    <span className="text-2xl animate-pulse select-none">{spell.effect}</span>
                  </div>

                  <Link href="/premium/checkout">
                    <button className="w-full text-center py-2.5 bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]">
                      ACQUIRE WITH PASS
                    </button>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ── COMPARISONS & BENEFITS GRID ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-2">
          
          {/* Comparisons */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-[#BFC7D5]" />
              <h2 className="font-mono text-[10px] tracking-widest text-[#BFC7D5] uppercase font-bold">Summoner Pass Comparison</h2>
              <div className="flex-1 h-px bg-[#2D3748]" />
            </div>

            <FantasyPixelCard theme="cyan" shimmer={true} noPadding={true}>
              <div className="w-full overflow-x-auto scrollbar-none">
                <div className="min-w-[450px] overflow-hidden font-mono text-[8px] tracking-wider relative">
                  {/* Table header */}
                  <div className="grid grid-cols-12 p-4 bg-[#2D3748] border-b-2 border-[#4A5568] text-[#8D99AE] uppercase tracking-widest font-bold">
                    <div className="col-span-6">PERK / CAPABILITY</div>
                    <div className="col-span-3 text-center">INITIATE (FREE)</div>
                    <div className="col-span-3 text-center text-[#FACC15]">ARCHMAGE PASS</div>
                  </div>

                  {/* Table rows */}
                  <div className="divide-y divide-[#2D3748] bg-[#1E2530]/20 text-[8px]">
                    {featuresComparison.map((f, i) => (
                      <div key={i} className="grid grid-cols-12 p-3.5 items-center hover:bg-[#2D3748]/10 transition-colors border-b border-[#2D3748]/35">
                        <div className="col-span-6 flex items-center gap-2">
                          <f.icon className={cn("h-3.5 w-3.5", f.premium ? "text-[#FACC15]" : "text-[#8D99AE]")} />
                          <span className="text-zinc-100 font-bold uppercase tracking-wider text-[8px]">{f.name}</span>
                        </div>
                        <div className="col-span-3 text-center text-[#8D99AE]/60 uppercase">{f.initiate}</div>
                        <div className={cn("col-span-3 text-center font-bold uppercase", f.premium ? "text-[#FACC15] text-glow-gold" : "text-[#BFC7D5]")}>
                          {f.archmage}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FantasyPixelCard>
          </div>

          {/* Premium Rewards List */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-[#FACC15]" />
              <h2 className="font-mono text-[10px] tracking-widest text-[#FACC15] uppercase font-bold">Exclusive Pass Rewards</h2>
              <div className="flex-1 h-px bg-[#2D3748]" />
            </div>

            <FantasyPixelCard theme="purple" shimmer={true} noPadding={true}>
              <div className="flex flex-col gap-4 p-5 sm:p-6 justify-between h-full relative">
                <div className="flex flex-col gap-4">
                  
                  {/* Reward 1 */}
                  <div className="p-4 border-2 border-[#FACC15] bg-[#FACC15]/5 shadow-[4px_4px_0px_#000000] relative flex gap-4 items-center rounded-none font-mono">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute top-1 right-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#FACC15]" />

                    <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-[#FACC15]/40 bg-[#FACC15]/10 text-[#FACC15] rounded-none">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-bold text-[9px] text-zinc-150 uppercase tracking-wide">Priority ELO Badge</span>
                      <span className="text-[8px] text-[#8D99AE] mt-1 leading-normal tracking-wide lowercase">Glowing gold crowns attached to leaderboards and profiles.</span>
                    </div>
                  </div>

                  {/* Reward 2 */}
                  <div className="p-4 border-2 border-[#FACC15] bg-[#FACC15]/5 shadow-[4px_4px_0px_#000000] relative flex gap-4 items-center rounded-none font-mono">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute top-1 right-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#FACC15]" />

                    <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-[#FACC15]/40 bg-[#FACC15]/10 text-[#FACC15] rounded-none">
                      <Wand2 className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-bold text-[9px] text-zinc-150 uppercase tracking-wide">Beta Chaos Spellsets</span>
                      <span className="text-[8px] text-[#8D99AE] mt-1 leading-normal tracking-wide lowercase">Test experimental and extreme game modifications.</span>
                    </div>
                  </div>

                  {/* Reward 3 */}
                  <div className="p-4 border-2 border-[#FACC15] bg-[#FACC15]/5 shadow-[4px_4px_0px_#000000] relative flex gap-4 items-center rounded-none font-mono">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute top-1 right-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#FACC15]" />
                    <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#FACC15]" />

                    <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-[#FACC15]/40 bg-[#FACC15]/10 text-[#FACC15] rounded-none">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-bold text-[9px] text-zinc-150 uppercase tracking-wide">Unlimited Compute</span>
                      <span className="text-[8px] text-[#8D99AE] mt-1 leading-normal tracking-wide lowercase">Unlock full analysis depth from our cloud-hosted engine.</span>
                    </div>
                  </div>

                </div>

                <div className="border border-[#FACC15]/20 bg-[#FACC15]/5 p-3.5 font-mono text-[8px] leading-relaxed text-[#FACC15] uppercase mt-4 select-none tracking-wide text-center">
                  ALL REWARDS ACCRUE IMMEDIATELY UPON SECURING YOUR ATTUNEMENT PASS.
                </div>
              </div>
            </FantasyPixelCard>
          </div>

        </div>

      </div>
      <Footer />
    </main>
  )
}
