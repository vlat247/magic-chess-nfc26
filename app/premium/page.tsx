'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/arcane-chess/header'
import { Footer } from '@/components/arcane-chess/footer'
import { GlobalParticles } from '@/components/arcane-chess/global-particles'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Sparkles, Swords, Trophy, Wand2, Zap, HelpCircle, Lock, Crown, ArrowRight, Eye, Check } from 'lucide-react'

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
    { id: 'neon-abyss', name: 'NEON ABYSS', desc: 'Cyberpunk glow square matrix grid.', bg: 'bg-fuchsia-950/20 border-fuchsia-500/30 text-neon-pink', label: 'Premium Board', colors: ['#a21caf', '#3b0764'] },
    { id: 'molten-core', name: 'MOLTEN CORE', desc: 'Fiery glowing gold and magma tiles.', bg: 'bg-amber-950/20 border-amber-500/30 text-neon-gold', label: 'Premium Board', colors: ['#d97706', '#451a03'] },
    { id: 'cosmic-void', name: 'COSMIC VOID', desc: 'Nebula cosmic void and blue starfield.', bg: 'bg-cyan-950/20 border-cyan-500/30 text-neon-cyan', label: 'Premium Board', colors: ['#0891b2', '#042f2e'] },
  ]

  const pieces = [
    { id: 'arcane-runes', name: 'ARCANE RUNES', desc: 'Glowing runic symbols on slate.', bg: 'bg-yellow-950/20 border-yellow-500/30 text-neon-gold', label: 'Premium Pieces', symbol: 'ᛟ' },
    { id: 'hologram', name: 'HOLOGRAM VECTOR', desc: 'Wireframe futuristic vector matrix.', bg: 'bg-cyan-950/20 border-cyan-500/30 text-neon-cyan', label: 'Premium Pieces', symbol: '♞' },
  ]

  const spells = [
    { id: 'glacial-spike', name: 'GLACIAL SHATTER', desc: 'Explosions of icy pixel fragments.', bg: 'bg-sky-950/20 border-sky-500/30 text-neon-cyan', label: 'Premium VFX', effect: '❄️' },
    { id: 'void-implosion', name: 'VOID VORTEX', desc: 'Imploding micro black hole stars.', bg: 'bg-purple-950/20 border-purple-500/30 text-neon-purple', label: 'Premium VFX', effect: '🌀' },
    { id: 'solar-flare', name: 'SOLAR FLARE', desc: 'Eruptions of pixelated plasma fire.', bg: 'bg-orange-950/20 border-orange-500/30 text-orange-400', label: 'Premium VFX', effect: '🔥' },
  ]

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.1_0.03_280)] to-[oklch(0.05_0.01_280)] overflow-x-hidden pt-28 pb-16 px-4">
      <Header />
      <GlobalParticles />

      {/* Atmospheric overlays */}
      <div
        className="absolute inset-0 opacity-15 animate-grid pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,25,0.95)_100%)] z-0" />

      {/* Floating retro artifacts */}
      <div className="absolute top-1/4 left-10 w-8 h-8 border border-neon-gold/15 rotate-45 animate-float pointer-events-none z-0" />
      <div className="absolute top-1/3 right-16 w-5 h-5 bg-neon-purple/5 animate-float pointer-events-none z-0" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-6 h-6 border-2 border-neon-cyan/15 animate-float pointer-events-none z-0" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-12">
        
        {/* ── CINEMATIC FEATURED PASS BANNER ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full border border-neon-gold/50 bg-gradient-to-r from-purple-950/40 via-black/80 to-amber-950/45 p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.12)] group"
        >
          {/* Animated glow orb */}
          <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-neon-gold/5 blur-3xl group-hover:bg-neon-gold/8 transition-all duration-700" />
          <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-neon-purple/5 blur-3xl" />
          
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,1)_50%)] bg-[size:100%_4px]" />
          
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-neon-gold" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-neon-gold" />
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-neon-gold" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-neon-gold" />

          {/* Left panel: featured pass */}
          <div className="flex flex-col gap-4 max-w-xl text-center lg:text-left z-10">
            <span className="font-mono text-[9px] text-neon-gold tracking-widest uppercase border border-neon-gold/30 bg-neon-gold/10 px-3 py-1 self-center lg:self-start flex items-center gap-1.5 font-bold animate-pulse-glow">
              <Crown className="h-3 w-3" /> SEASON 1 CHESS PASS Active
            </span>
            <h1 
              className="font-title text-4xl sm:text-5xl md:text-6xl text-neon-gold text-glow-gold tracking-wider leading-none"
              style={{ fontFamily: 'var(--font-jacquard)' }}
            >
              ARCHMAGE CODES UNLOCKED
            </h1>
            <p className="font-mono text-[9px] sm:text-[10px] leading-relaxed text-muted-foreground uppercase tracking-widest mt-1">
              Gain access to the ultimate chess customizers. Unleash cosmic board skins, pixelated spell visuals, hologram vectors, and unlimited coach computation inside the sanctum.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap mt-2">
              <div className="flex items-center gap-1.5 font-mono text-[8px] text-neon-cyan tracking-wider bg-neon-cyan/5 border border-neon-cyan/20 px-2 py-1">
                <Check className="h-3 w-3" /> 4 BOARD SKINSETS
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[8px] text-neon-purple tracking-wider bg-neon-purple/5 border border-neon-purple/20 px-2 py-1">
                <Check className="h-3 w-3" /> 3 PIECE STYLES
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[8px] text-neon-pink tracking-wider bg-neon-pink/5 border border-neon-pink/20 px-2 py-1">
                <Check className="h-3 w-3" /> 3 SPELLCAST VFX
              </div>
            </div>
          </div>

          {/* Right panel: CTA Card */}
          <div className="w-full lg:w-[320px] shrink-0 border-2 border-neon-gold/60 bg-black/90 p-6 flex flex-col justify-center items-center text-center relative z-10">
            <div className="absolute top-0 left-0 w-2 h-2 bg-neon-gold" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-neon-gold" />
            
            <span className="font-mono text-[8px] text-muted-foreground tracking-widest uppercase">MONTHLY ATTUNEMENT</span>
            <div className="text-3xl font-bold font-mono text-glow-gold text-neon-gold mt-1.5">$9.99<span className="text-[10px] text-muted-foreground tracking-normal font-normal"> / MO</span></div>
            <p className="font-mono text-[8px] text-muted-foreground/80 mt-1 uppercase tracking-widest">Cancel anytime • Secure summoning portal</p>
            
            <div className="w-full h-px bg-border/40 my-4" />
            
            <Link href="/premium/checkout" className="w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-neon-gold hover:bg-neon-gold/90 text-background font-sans font-bold text-[10px] tracking-widest pixel-border-gold glow-gold uppercase cursor-pointer"
              >
                ENTER SECURE PORTAL <ArrowRight className="h-3 w-3 inline ml-1 align-middle" />
              </motion.button>
            </Link>

            <span className="font-mono text-[7px] text-muted-foreground/60 mt-3 uppercase tracking-widest">30-DAY GOLDEN GUARANTEE INCLUDED</span>
          </div>
        </motion.div>

        {/* ── COSMETICS & SKINS SHOPPING CATEGORIES ────────────────────────── */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-neon-purple" />
              <h2 className="font-mono text-[11px] tracking-widest text-neon-purple uppercase font-bold">
                Arcane Cosmetic Catalog
              </h2>
            </div>
            
            {/* Filter buttons */}
            <div className="flex items-center gap-2 font-mono text-[8px] tracking-widest">
              {(['all', 'boards', 'pieces', 'spells'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCatalog(cat)}
                  className={`px-3 py-1.5 uppercase font-bold border transition-all duration-300 cursor-pointer ${
                    activeCatalog === cat
                      ? 'bg-neon-purple/10 border-neon-purple text-neon-purple glow-purple'
                      : 'bg-black/20 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {cat === 'all' ? 'All Unlocks' : cat}
                </button>
              ))}
            </div>
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
                  className={`p-5 border bg-gradient-to-b from-card/30 to-background/50 flex flex-col justify-between min-h-[220px] relative transition-all duration-300 group ${board.bg}`}
                  onMouseEnter={() => setHoveredCard(board.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/30" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/30" />

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-widest">{board.label}</span>
                      <span className="text-neon-gold text-[7px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest">
                        <Lock className="h-2 w-2" /> PASS
                      </span>
                    </div>

                    <h3 className="font-sans text-[13px] font-bold text-foreground mt-2 tracking-wide group-hover:text-glow transition-all duration-300">{board.name}</h3>
                    <p className="font-mono text-[8px] text-muted-foreground/80 leading-relaxed mt-1 uppercase tracking-wider">{board.desc}</p>
                  </div>

                  {/* Micro Visual representation of board skin */}
                  <div className="w-full h-12 bg-black/40 border border-border/40 my-3 flex items-center justify-center gap-1.5 overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,1)_50%)] bg-[size:100%_4px]" />
                    <div className="grid grid-cols-4 gap-0.5 w-16 h-8 border border-border/20">
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
                    <button className="w-full text-center py-2.5 bg-neon-gold/8 hover:bg-neon-gold/20 border border-neon-gold/30 hover:border-neon-gold text-neon-gold font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold">
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
                  className={`p-5 border bg-gradient-to-b from-card/30 to-background/50 flex flex-col justify-between min-h-[220px] relative transition-all duration-300 group ${piece.bg}`}
                  onMouseEnter={() => setHoveredCard(piece.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/30" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/30" />

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-widest">{piece.label}</span>
                      <span className="text-neon-gold text-[7px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest">
                        <Lock className="h-2 w-2" /> PASS
                      </span>
                    </div>

                    <h3 className="font-sans text-[13px] font-bold text-foreground mt-2 tracking-wide group-hover:text-glow transition-all duration-300">{piece.name}</h3>
                    <p className="font-mono text-[8px] text-muted-foreground/80 leading-relaxed mt-1 uppercase tracking-wider">{piece.desc}</p>
                  </div>

                  {/* Micro Visual representation of piece skin */}
                  <div className="w-full h-12 bg-black/40 border border-border/40 my-3 flex items-center justify-center overflow-hidden relative">
                    <span className="text-glow text-xl font-bold">{piece.symbol}</span>
                  </div>

                  <Link href="/premium/checkout">
                    <button className="w-full text-center py-2.5 bg-neon-gold/8 hover:bg-neon-gold/20 border border-neon-gold/30 hover:border-neon-gold text-neon-gold font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold">
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
                  className={`p-5 border bg-gradient-to-b from-card/30 to-background/50 flex flex-col justify-between min-h-[220px] relative transition-all duration-300 group ${spell.bg}`}
                  onMouseEnter={() => setHoveredCard(spell.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/30" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/30" />

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-widest">{spell.label}</span>
                      <span className="text-neon-gold text-[7px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest">
                        <Lock className="h-2 w-2" /> PASS
                      </span>
                    </div>

                    <h3 className="font-sans text-[13px] font-bold text-foreground mt-2 tracking-wide group-hover:text-glow transition-all duration-300">{spell.name}</h3>
                    <p className="font-mono text-[8px] text-muted-foreground/80 leading-relaxed mt-1 uppercase tracking-wider">{spell.desc}</p>
                  </div>

                  {/* Micro Visual representation of spell VFX */}
                  <div className="w-full h-12 bg-black/40 border border-border/40 my-3 flex items-center justify-center overflow-hidden relative">
                    <span className="text-2xl animate-pulse select-none">{spell.effect}</span>
                  </div>

                  <Link href="/premium/checkout">
                    <button className="w-full text-center py-2.5 bg-neon-gold/8 hover:bg-neon-gold/20 border border-neon-gold/30 hover:border-neon-gold text-neon-gold font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold">
                      ACQUIRE WITH PASS
                    </button>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ── COMPARISONS & BENEFITS GRID ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Comparisons */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-mono text-[10px] tracking-widest text-neon-cyan uppercase font-bold">Summoner Pass Comparison</h2>
              <div className="flex-1 h-px bg-neon-cyan opacity-15" />
            </div>

            <div className="border border-border/80 bg-gradient-to-b from-card/30 to-background/50 overflow-hidden font-mono text-[9px] tracking-wider relative shadow-lg">
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/20" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/20" />

              {/* Table header */}
              <div className="grid grid-cols-12 p-3 bg-black/40 border-b border-border/60 text-muted-foreground/80 uppercase text-[8px] tracking-widest font-bold">
                <div className="col-span-6">PERK / CAPABILITY</div>
                <div className="col-span-3 text-center">INITIATE (FREE)</div>
                <div className="col-span-3 text-center text-neon-gold">ARCHMAGE PASS</div>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-border/30">
                {featuresComparison.map((f, i) => (
                  <div key={i} className="grid grid-cols-12 p-3.5 items-center hover:bg-white/[0.02] transition-colors">
                    <div className="col-span-6 flex items-center gap-2">
                      <f.icon className={`h-3.5 w-3.5 ${f.premium ? 'text-neon-gold' : 'text-neon-cyan'}`} />
                      <span className="text-foreground/90 font-bold uppercase tracking-wider text-[8px]">{f.name}</span>
                    </div>
                    <div className="col-span-3 text-center text-muted-foreground/60 uppercase">{f.initiate}</div>
                    <div className={`col-span-3 text-center font-bold uppercase ${f.premium ? 'text-neon-gold text-glow-gold' : 'text-neon-purple'}`}>
                      {f.archmage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Rewards List */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-neon-gold" />
              <h2 className="font-mono text-[10px] tracking-widest text-neon-gold uppercase font-bold">Exclusive Pass Rewards</h2>
              <div className="flex-1 h-px bg-neon-gold opacity-15" />
            </div>

            <div className="border border-border/80 bg-gradient-to-b from-card/30 to-background/50 p-6 flex flex-col gap-4 justify-between h-full relative shadow-lg">
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/20" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/20" />

              <div className="flex flex-col gap-4">
                <div className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center border border-neon-gold/20 bg-neon-gold/5 text-neon-gold">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 font-mono">
                    <span className="text-[9px] font-bold text-foreground uppercase tracking-wider">Priority ELO Badge</span>
                    <span className="text-[8px] text-muted-foreground uppercase leading-normal tracking-wide">Glowing gold crowns attached to leaderboards and profiles.</span>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 font-mono">
                    <span className="text-[9px] font-bold text-foreground uppercase tracking-wider">Beta Chaos spellsets</span>
                    <span className="text-[8px] text-muted-foreground uppercase leading-normal tracking-wide">Test experimental and extreme game modifications.</span>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center border border-neon-pink/20 bg-neon-pink/5 text-neon-pink">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 font-mono">
                    <span className="text-[9px] font-bold text-foreground uppercase tracking-wider">Unlimited compute</span>
                    <span className="text-[8px] text-muted-foreground uppercase leading-normal tracking-wide">Unlock full analysis depth from our cloud-hosted engine.</span>
                  </div>
                </div>
              </div>

              <div className="border border-neon-gold/20 bg-neon-gold/5 p-3.5 font-mono text-[8px] leading-relaxed text-neon-gold uppercase mt-2 select-none tracking-wide text-center">
                ALL REWARDS ACCRUE IMMEDIATELY UPON SECURING YOUR ATTUNEMENT PASS.
              </div>
            </div>
          </div>

        </div>

      </div>
      <Footer />
    </main>
  )
}
