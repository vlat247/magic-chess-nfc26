'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/arcane-chess/header'
import { Footer } from '@/components/arcane-chess/footer'
import { GlobalParticles } from '@/components/arcane-chess/global-particles'
import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Swords, Trophy, Wand2, Zap, HelpCircle } from 'lucide-react'

const featuresComparison = [
  { name: 'Access to Spell Modes', initiate: 'Basic Spells', archmage: 'All Unlocked + Future Spells', icon: Wand2, premium: false },
  { name: 'Custom Board Skins', initiate: 'Classic Wood', archmage: 'Neon Abyss, Molten Core, Cosmic Void', icon: Sparkles, premium: true },
  { name: 'Unique Piece Styles', initiate: 'Classic', archmage: 'Hologram, Arcane Runes, Chibi-Monsters', icon: Swords, premium: true },
  { name: 'Custom Spell VFX', initiate: 'Standard Sparks', archmage: 'Glacial Freeze, Solar Flare, Void Vortex', icon: Zap, premium: true },
  { name: 'Summoner ELO & Leaderboards', initiate: 'Global', initiateCheck: true, archmage: 'Global + City Leagues + Priority Badge', icon: Trophy, premium: false },
  { name: 'Advanced AI Coach', initiate: 'Limited Analysis', archmage: 'Unlimited Depth + Full Move Explanations', icon: ShieldCheck, premium: true },
]

export default function PremiumPage() {
  const [activePreview, setActivePreview] = useState<'board' | 'piece' | 'spell'>('board')

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)] overflow-x-hidden pt-28 pb-16 px-4">
      <Header />
      <GlobalParticles />

      {/* Atmospheric overlays */}
      <div
        className="absolute inset-0 opacity-10 animate-grid pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,25,0.9)_100%)] z-0" />

      {/* Floating retro artifacts */}
      <div className="absolute top-1/4 left-10 w-8 h-8 border border-neon-gold/20 rotate-45 animate-float pointer-events-none" />
      <div className="absolute top-1/3 right-16 w-5 h-5 bg-neon-purple/10 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-6 h-6 border-2 border-neon-cyan/25 animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-16">
        
        {/* ── HEADER TITLE ─────────────────────────────────────────────────── */}
        <div className="text-center flex flex-col items-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 flex items-center justify-center bg-neon-gold/10 border-2 border-neon-gold glow-gold mb-3"
          >
            <svg viewBox="0 0 32 32" className="w-9 h-9 text-neon-gold" fill="currentColor">
              <rect x="4" y="24" width="24" height="4" />
              <rect x="4" y="12" width="4" height="12" />
              <rect x="24" y="12" width="4" height="12" />
              <rect x="14" y="8" width="4" height="16" />
              <rect x="4" y="8" width="4" height="4" />
              <rect x="24" y="8" width="4" height="4" />
              <rect x="14" y="4" width="4" height="4" />
              <rect x="8" y="16" width="4" height="8" />
              <rect x="20" y="16" width="4" height="8" />
            </svg>
          </motion.div>
          
          <h1 
            className="font-title text-4xl sm:text-5xl md:text-6xl text-neon-gold text-glow-gold tracking-wide"
            style={{ fontFamily: 'var(--font-jacquard)' }}
          >
            ARCHMAGE PRO
          </h1>
          <p className="font-sans text-[11px] sm:text-xs tracking-widest text-muted-foreground max-w-xl leading-relaxed mt-2 uppercase">
            Ascend to the highest tier of the sanctum. Unlock ancient cosmetics, custom boards, runic pieces, and premium spell enhancements.
          </p>
        </div>

        {/* ── DYNAMIC COSMETIC PREVIEW CARD ──────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-neon-gold" style={{ filter: 'drop-shadow(0 0 6px oklch(0.8 0.18 85))' }} />
            <h2 className="font-mono text-xs tracking-widest text-neon-gold uppercase" style={{ textShadow: '0 0 8px oklch(0.8 0.18 85 / 0.4)' }}>
              Interactive Armory Preview
            </h2>
            <div className="flex-1 h-px bg-neon-gold opacity-20" />
          </div>

          <div 
            className="grid grid-cols-1 md:grid-cols-12 border border-[oklch(0.22_0.06_300)] bg-[oklch(0.09_0.025_280)] overflow-hidden relative"
            style={{ boxShadow: '0 0 40px oklch(0.7 0.25 300 / 0.1)' }}
          >
            {/* Sidebar selection */}
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[oklch(0.2_0.04_280)] p-5 flex flex-col gap-3 justify-center bg-[oklch(0.07_0.02_280)]">
              <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase mb-1">SELECT PREVIEW TARGET</span>
              
              <button
                onClick={() => setActivePreview('board')}
                className={`w-full text-left p-3 border font-mono text-[10px] tracking-wider transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  activePreview === 'board'
                    ? 'border-neon-gold bg-neon-gold/5 text-neon-gold glow-gold'
                    : 'border-[oklch(0.2_0.04_280)] hover:border-[oklch(0.4_0.08_280)] text-foreground/80'
                }`}
              >
                <span>BOARD COSMETICS</span>
                <span className="text-[9px] opacity-70">3 SKINS</span>
              </button>
              
              <button
                onClick={() => setActivePreview('piece')}
                className={`w-full text-left p-3 border font-mono text-[10px] tracking-wider transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  activePreview === 'piece'
                    ? 'border-neon-gold bg-neon-gold/5 text-neon-gold glow-gold'
                    : 'border-[oklch(0.2_0.04_280)] hover:border-[oklch(0.4_0.08_280)] text-foreground/80'
                }`}
              >
                <span>PIECE CUSTOMIZER</span>
                <span className="text-[9px] opacity-70">2 THEMES</span>
              </button>
              
              <button
                onClick={() => setActivePreview('spell')}
                className={`w-full text-left p-3 border font-mono text-[10px] tracking-wider transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  activePreview === 'spell'
                    ? 'border-neon-gold bg-neon-gold/5 text-neon-gold glow-gold'
                    : 'border-[oklch(0.2_0.04_280)] hover:border-[oklch(0.4_0.08_280)] text-foreground/80'
                }`}
              >
                <span>SPELL EFFECTS (VFX)</span>
                <span className="text-[9px] opacity-70">3 RUNES</span>
              </button>
            </div>

            {/* Content preview board */}
            <div className="md:col-span-8 p-6 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px] relative overflow-hidden bg-black/40">
              
              {activePreview === 'board' && (
                <div className="flex flex-col sm:flex-row gap-6 w-full items-center justify-around animate-in fade-in duration-200">
                  {/* Molten Preview */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-32 h-32 grid grid-cols-4 border-2 border-[oklch(0.8_0.18_85)] overflow-hidden shadow-[0_0_15px_oklch(0.8_0.18_85/0.4)]">
                      {[...Array(16)].map((_, i) => {
                        const isDark = (Math.floor(i / 4) + (i % 4)) % 2 === 1
                        return (
                          <div 
                            key={i} 
                            style={{ 
                              backgroundColor: isDark ? 'oklch(0.2_0.05_25)' : 'oklch(0.85_0.15_70)',
                              boxShadow: !isDark ? 'inset 0 0 6px oklch(0.8_0.18_85/0.4)' : 'none'
                            }} 
                          />
                        )
                      })}
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-neon-gold mt-1">MOLTEN CORE</span>
                  </div>

                  {/* Neon Abyss */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-32 h-32 grid grid-cols-4 border-2 border-[oklch(0.7_0.25_300)] overflow-hidden shadow-[0_0_15px_oklch(0.7_0.25_300/0.4)]">
                      {[...Array(16)].map((_, i) => {
                        const isDark = (Math.floor(i / 4) + (i % 4)) % 2 === 1
                        return (
                          <div 
                            key={i} 
                            style={{ 
                              backgroundColor: isDark ? 'oklch(0.1_0.02_280)' : 'oklch(0.2_0.05_300)',
                              boxShadow: !isDark ? 'inset 0 0 6px oklch(0.7_0.25_300/0.3)' : 'none',
                              border: isDark ? '1px solid oklch(0.7_0.25_300/0.1)' : 'none'
                            }} 
                          />
                        )
                      })}
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-neon-purple mt-1">NEON ABYSS</span>
                  </div>
                </div>
              )}

              {activePreview === 'piece' && (
                <div className="flex flex-col sm:flex-row gap-6 w-full items-center justify-around animate-in fade-in duration-200">
                  {/* Runes Piece */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 border border-neon-gold/30 bg-neon-gold/5 flex items-center justify-center rounded-full glow-gold">
                      <div className="text-neon-gold text-2xl font-bold font-title select-none animate-pulse">ᛟ</div>
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-neon-gold mt-1">ARCANE RUNES</span>
                  </div>

                  {/* Hologram Piece */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 border border-neon-cyan/30 bg-neon-cyan/5 flex items-center justify-center shadow-[0_0_15px_oklch(0.7_0.2_195/0.25)] relative overflow-hidden">
                      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-scanlines" style={{ backgroundSize: '100% 8px' }} />
                      <div className="text-neon-cyan text-3xl font-bold font-mono select-none drop-shadow-[0_0_8px_#22d3ee]">♞</div>
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-neon-cyan mt-1">HOLOGRAM VECTOR</span>
                  </div>
                </div>
              )}

              {activePreview === 'spell' && (
                <div className="flex flex-col sm:flex-row gap-8 w-full items-center justify-center animate-in fade-in duration-200">
                  <div className="flex flex-col items-center gap-2 relative">
                    <div className="w-20 h-20 border-2 border-dashed border-red-500/30 flex items-center justify-center rounded-full">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 animate-pulse glow-gold filter blur-[1px]" />
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-red-400">SOLAR BURST</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 relative">
                    <div className="w-20 h-20 border-2 border-dashed border-cyan-400/30 flex items-center justify-center rounded-full">
                      <div className="w-12 h-12 border border-cyan-300 bg-cyan-400/20 shadow-[0_0_12px_#22d3ee] flex items-center justify-center rounded-sm">
                        <span className="text-cyan-200 text-xs font-bold animate-pulse">❄️</span>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-cyan-400">GLACIAL ICE</span>
                  </div>
                </div>
              )}

              {/* Holographic Lock Icon */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 border border-neon-gold/20 bg-neon-gold/5 pointer-events-none select-none">
                <ShieldCheck className="h-3 w-3 text-neon-gold animate-pulse" />
                <span className="font-mono text-[8px] text-neon-gold tracking-widest">ARCHMAGE EXCLUSIVE PREVIEW</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING CARD & BENEFITS GRID ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Comparisons */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-neon-purple" />
              <h2 className="font-mono text-xs tracking-widest text-neon-purple uppercase">Comparison Codex</h2>
              <div className="flex-1 h-px bg-neon-purple opacity-20" />
            </div>

            <div className="border border-[oklch(0.22_0.06_300)] bg-[oklch(0.09_0.025_280)] overflow-hidden font-mono text-[9px] sm:text-[10px] tracking-wider">
              {/* Table header */}
              <div className="grid grid-cols-12 p-3 bg-[oklch(0.07_0.02_280)] border-b border-[oklch(0.2_0.04_280)] text-muted-foreground uppercase text-[8px] tracking-widest">
                <div className="col-span-6">PERK / CAPABILITY</div>
                <div className="col-span-3 text-center">INITIATE (FREE)</div>
                <div className="col-span-3 text-center text-neon-gold">ARCHMAGE (PRO)</div>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-[oklch(0.18_0.03_280)]">
                {featuresComparison.map((f, i) => (
                  <div key={i} className="grid grid-cols-12 p-3.5 items-center hover:bg-white/[0.02] transition-colors">
                    <div className="col-span-6 flex items-center gap-2">
                      <f.icon className={`h-3.5 w-3.5 ${f.premium ? 'text-neon-gold' : 'text-neon-cyan'}`} />
                      <span className="text-foreground/90">{f.name}</span>
                    </div>
                    <div className="col-span-3 text-center text-muted-foreground">{f.initiate}</div>
                    <div className={`col-span-3 text-center font-bold ${f.premium ? 'text-neon-gold text-glow-gold' : 'text-neon-purple'}`}>
                      {f.archmage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upgrade Portal Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="h-full border-2 border-neon-gold glow-gold p-8 flex flex-col justify-between items-center relative overflow-hidden bg-[oklch(0.1_0.03_280)] text-center">
              
              {/* Neon border squares */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-neon-gold" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-gold" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-neon-gold" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-neon-gold" />

              <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-shimmer" />

              <div className="flex flex-col items-center gap-2 w-full mt-4">
                <span className="font-mono text-[9px] text-neon-gold tracking-widest uppercase border border-neon-gold/40 px-3 py-1 bg-neon-gold/5 rounded-full select-none">
                  MEMBERSHIP PASS
                </span>
                
                <h3 className="font-title text-3xl text-neon-gold text-glow-gold uppercase mt-2">
                  ARCHMAGE PRO
                </h3>
                
                <p className="font-sans text-[10px] text-muted-foreground mt-1 uppercase max-w-xs">
                  Unlock the core magical visualizers, retro cosmetics, and unlimited analysis in the sanctum.
                </p>

                <div className="my-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-mono text-3xl font-bold text-foreground">$9.99</span>
                    <span className="font-mono text-[9px] text-muted-foreground">/ MONTH</span>
                  </div>
                  <span className="font-mono text-[8px] text-neon-cyan tracking-widest block mt-1 uppercase">CANCEL ANYTIME • SECURE SUMMONING</span>
                </div>
              </div>

              {/* Checkout link button */}
              <div className="w-full flex flex-col gap-3 mt-4 mb-2 relative z-10">
                <Link href="/premium/checkout" className="w-full">
                  <button
                    className="w-full font-sans text-[10px] sm:text-xs tracking-widest py-4 px-6 font-bold cursor-pointer active:scale-95 transition-all duration-200 bg-neon-gold hover:bg-neon-gold/90 text-background pixel-border-gold glow-gold uppercase"
                  >
                    ENTER CHECKOUT PORTAL
                  </button>
                </Link>
                <span className="font-mono text-[8px] text-muted-foreground/80 uppercase">
                  30-DAY GOLDEN GUARANTEE INCLUDED
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
      <Footer />
    </main>
  )
}
