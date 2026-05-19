'use client'

import React, { useState, useTransition } from 'react'
import { equipCosmetic } from '@/actions/cosmetics'
import { updateSummonerProfile } from '@/actions/profile'
import { GameModeHub } from '@/components/multiplayer/game-mode-hub'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import {
  Swords, Sparkles, Trophy, Settings, ShieldCheck, 
  MapPin, Wand2, Zap, Star, Shield, Lock, CheckCircle2, Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileTabsProps {
  userId: string
  profile: any
  matches: any[]
  achievements: any[]
  isPro: boolean
}

// Predefined Board Themes
const boardThemes = [
  { id: 'classic', name: 'Classic Sanctum', desc: 'Default purple and dark fantasy squares.', premium: false, colorClass: 'border-purple-500/20 text-neon-purple', glow: 'shadow-[0_0_15px_oklch(0.7_0.25_300/0.1)]' },
  { id: 'neon-abyss', name: 'Neon Abyss', desc: 'Cyberpunk neon-purple glowing square matrix.', premium: true, colorClass: 'border-fuchsia-500/40 text-neon-pink', glow: 'shadow-[0_0_20px_oklch(0.7_0.22_330/0.25)] hover:border-neon-pink/70' },
  { id: 'molten-core', name: 'Molten Core', desc: 'Fiery gold and glowing magma squares.', premium: true, colorClass: 'border-amber-500/40 text-neon-gold', glow: 'shadow-[0_0_20px_oklch(0.8_0.18_85/0.25)] hover:border-neon-gold/70' },
  { id: 'cosmic-void', name: 'Cosmic Void', desc: 'Nebula cosmic starfield and blue void tiles.', premium: true, colorClass: 'border-cyan-500/40 text-neon-cyan', glow: 'shadow-[0_0_20px_oklch(0.7_0.2_195/0.25)] hover:border-neon-cyan/70' },
]

// Predefined Piece Styles
const pieceStyles = [
  { id: 'classic', name: 'Classic Chess', desc: 'Standard visual chess designs.', premium: false, colorClass: 'border-zinc-500/20 text-muted-foreground', glow: 'shadow-sm' },
  { id: 'arcane-runes', name: 'Arcane Runes', desc: 'Glowing circular runic glyph engravings.', premium: true, colorClass: 'border-yellow-500/40 text-neon-gold', glow: 'shadow-[0_0_20px_oklch(0.8_0.18_85/0.25)] hover:border-neon-gold/70' },
  { id: 'hologram', name: 'Hologram Vector', desc: 'Glowing wireframe vector grid styles.', premium: true, colorClass: 'border-cyan-500/40 text-neon-cyan', glow: 'shadow-[0_0_20px_oklch(0.7_0.2_195/0.25)] hover:border-neon-cyan/70' },
]

// Predefined Spell Effects
const spellEffects = [
  { id: 'classic', name: 'Sparks & Fire', desc: 'Standard fireball and flame burst effects.', premium: false, colorClass: 'border-orange-500/20 text-orange-400', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.1)]' },
  { id: 'glacial-spike', name: 'Glacial Shatter', desc: 'Freezing ice crystals explosion.', premium: true, colorClass: 'border-cyan-500/40 text-neon-cyan', glow: 'shadow-[0_0_20px_oklch(0.7_0.2_195/0.25)] hover:border-neon-cyan/70' },
  { id: 'void-implosion', name: 'Void Vortex', desc: 'Swirling dark hole implosions.', premium: true, colorClass: 'border-purple-500/40 text-neon-purple', glow: 'shadow-[0_0_20px_oklch(0.7_0.25_300/0.25)] hover:border-neon-purple/70' },
]

// Standard achievements template to compare against unlocked ones
const standardAchievements = [
  { name: 'First Blood', desc: 'Win your first chess duel', icon: Shield, xp: 200 },
  { name: 'Spellbinder', desc: 'Duel in Chaos Spell Mode', icon: Wand2, xp: 100 },
  { name: 'Unstoppable', desc: 'Achieve a 3-game win streak', icon: Zap, xp: 500 },
  { name: 'Grandmaster', desc: 'Reach a rating of 1400 ELO', icon: Trophy, xp: 1000 },
  { name: 'Archmage Initiate', desc: 'Upgrade to Archmage Pro membership', icon: Star, xp: 500 },
]

export function ProfileTabs({ userId, profile, matches, achievements, isPro }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'lobby' | 'armory' | 'spellbook' | 'settings'>('lobby')
  const [isPending, startTransition] = useTransition()

  // Account Settings state
  const [username, setUsername] = useState(profile?.username ?? 'Mage')
  const [city, setCity] = useState(profile?.city ?? '')

  // Equipping states
  const equippedBoard = profile?.board_skin ?? 'classic'
  const equippedPiece = profile?.piece_skin ?? 'classic'
  const equippedSpell = profile?.spell_effect ?? 'classic'

  const xpProgress = profile?.xp ? (profile.xp % 1000) / 10 : 0
  const xpNeeded = profile?.xp ? 1000 - (profile.xp % 1000) : 1000

  // Form Submission
  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim().length < 3) {
      toast({
        title: "Summoner Name Error",
        description: "Name must be at least 3 symbols.",
        variant: "destructive"
      })
      return
    }

    startTransition(async () => {
      try {
        await updateSummonerProfile(username, city.trim() ? city : null)
        toast({
          title: "Sanctum Updated",
          description: "Your summoner parameters have been synchronized."
        })
      } catch (err: any) {
        toast({
          title: "Update Failed",
          description: err.message || "Failed to update profile.",
          variant: "destructive"
        })
      }
    })
  }

  // Equipping Cosmetics Action
  const handleEquipCosmetic = (type: 'board' | 'piece' | 'spell', skinId: string) => {
    startTransition(async () => {
      try {
        await equipCosmetic(type, skinId)
        toast({
          title: "Cosmetic Attuned",
          description: `Successfully equipped the ${skinId.replace('-', ' ')} theme.`
        })
      } catch (err: any) {
        toast({
          title: "Attunement Blocked",
          description: err.message || "Upgrade to Pro to equip premium designs.",
          variant: "destructive"
        })
      }
    })
  }

  const tabs = [
    { id: 'lobby', label: 'Duel Lobby', icon: Swords, color: 'text-neon-purple', border: 'border-neon-purple' },
    { id: 'armory', label: 'Cosmetics Armory', icon: Sparkles, color: 'text-neon-gold', border: 'border-neon-gold' },
    { id: 'spellbook', label: 'Spellbook Progression', icon: Wand2, color: 'text-neon-cyan', border: 'border-neon-cyan' },
    { id: 'settings', label: 'Sanctum Configs', icon: Settings, color: 'text-neon-pink', border: 'border-neon-pink' },
  ] as const

  return (
    <div className="flex flex-col gap-6 w-full relative z-10">
      
      {/* ── INTERACTIVE TAB SELECTORS ────────────────────────────────────── */}
      <div 
        className="flex border-b border-border/60 bg-gradient-to-r from-card/30 to-background/50 overflow-x-auto scrollbar-none font-mono text-[9px] tracking-widest relative"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-300 uppercase flex items-center gap-2 shrink-0 relative",
                isActive
                  ? `${tab.color} text-glow`
                  : "border-transparent text-muted-foreground hover:text-foreground/85"
              )}
              style={{
                borderBottomColor: isActive ? `var(--neon-${tab.id === 'spellbook' ? 'cyan' : tab.id === 'settings' ? 'pink' : tab.id === 'armory' ? 'gold' : 'purple'})` : 'transparent'
              }}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-white/[0.02] -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── TAB WORKSPACES ───────────────────────────────────────────────── */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {/* TAB 1: DUEL LOBBY */}
            {activeTab === 'lobby' && (
              <div className="flex flex-col gap-4">
                <GameModeHub userId={userId} username={profile?.username ?? 'Mage'} />
              </div>
            )}

            {/* TAB 2: COSMETICS ARMORY */}
            {activeTab === 'armory' && (
              <div className="flex flex-col gap-8">
                
                {/* Board Themes Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-neon-gold" />
                    <h3 className="font-mono text-[10px] text-neon-gold tracking-widest uppercase font-bold">BOARD STYLES (THEMES)</h3>
                    <div className="flex-1 h-px bg-neon-gold opacity-15" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {boardThemes.map((board) => {
                      const isEquipped = equippedBoard === board.id
                      const isLocked = board.premium && !isPro
                      
                      return (
                        <motion.div 
                          key={board.id}
                          whileHover={{ y: -3, scale: 1.01 }}
                          className={cn(
                            "p-5 border bg-[oklch(0.125_0.015_280)] flex flex-col justify-between min-h-[180px] relative transition-all duration-300 group rounded-none",
                            isEquipped ? 'border-neon-gold/80 glow-gold bg-[oklch(0.135_0.02_280)]' : 'border-slate-800/80 hover:border-slate-700',
                            board.glow
                          )}
                        >
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/10 group-hover:border-foreground/20 transition-colors" />
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/10 group-hover:border-foreground/20 transition-colors" />

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start min-h-[18px]">
                              <span />
                              {isLocked ? (
                                <span className="text-neon-gold text-[7px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest animate-pulse-glow">
                                  <Lock className="h-2 w-2" /> PRO
                                </span>
                              ) : isEquipped ? (
                                <span className="text-neon-gold text-[7px] border border-neon-gold/40 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest">
                                  EQUIPPED
                                </span>
                              ) : null}
                            </div>

                            <h4 className="font-sans text-[13px] font-bold text-slate-100 tracking-wide group-hover:text-neon-gold transition-colors duration-300">{board.name}</h4>
                            <p className="font-sans text-[10px] text-slate-400/90 leading-relaxed mt-1.5 tracking-normal normal-case">{board.desc.toLowerCase()}</p>
                          </div>

                          <div className="mt-4">
                            {isLocked ? (
                              <button
                                onClick={() => window.location.href = '/premium'}
                                className="w-full text-center py-2 bg-neon-gold/15 hover:bg-neon-gold/30 border border-neon-gold/40 hover:border-neon-gold text-neon-gold font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold hover:scale-[1.01]"
                              >
                                UNLOCK WITH PRO
                              </button>
                            ) : (
                              <button
                                disabled={isEquipped}
                                onClick={() => handleEquipCosmetic('board', board.id)}
                                className={cn(
                                  "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold rounded-none",
                                  isEquipped 
                                    ? "bg-neon-gold/10 border border-neon-gold/30 text-neon-gold cursor-default"
                                    : "bg-slate-900/60 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white hover:bg-slate-800/80"
                                )}
                              >
                                {isEquipped ? 'Attuned' : 'Equip Theme'}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Piece Customizer Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Swords className="h-4 w-4 text-neon-cyan" />
                    <h3 className="font-mono text-[10px] text-neon-cyan tracking-widest uppercase font-bold">PIECE ART DESIGN</h3>
                    <div className="flex-1 h-px bg-neon-cyan opacity-15" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {pieceStyles.map((piece) => {
                      const isEquipped = equippedPiece === piece.id
                      const isLocked = piece.premium && !isPro

                      return (
                        <motion.div 
                          key={piece.id}
                          whileHover={{ y: -3, scale: 1.01 }}
                          className={cn(
                            "p-5 border bg-[oklch(0.125_0.015_280)] flex flex-col justify-between min-h-[180px] relative transition-all duration-300 group rounded-none",
                            isEquipped ? 'border-neon-cyan/80 glow-cyan bg-[oklch(0.135_0.02_280)]' : 'border-slate-800/80 hover:border-slate-700',
                            piece.glow
                          )}
                        >
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/10 group-hover:border-foreground/20 transition-colors" />
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/10 group-hover:border-foreground/20 transition-colors" />

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start min-h-[18px]">
                              <span />
                              {isLocked ? (
                                <span className="text-neon-gold text-[7px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest animate-pulse-glow">
                                  <Lock className="h-2 w-2" /> PRO
                                </span>
                              ) : isEquipped ? (
                                <span className="text-neon-cyan text-[7px] border border-neon-cyan/40 bg-neon-cyan/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest">
                                  EQUIPPED
                                </span>
                              ) : null}
                            </div>

                            <h4 className="font-sans text-[13px] font-bold text-slate-100 tracking-wide group-hover:text-neon-cyan transition-colors duration-300">{piece.name}</h4>
                            <p className="font-sans text-[10px] text-slate-400/90 leading-relaxed mt-1.5 tracking-normal normal-case">{piece.desc.toLowerCase()}</p>
                          </div>

                          <div className="mt-4">
                            {isLocked ? (
                              <button
                                onClick={() => window.location.href = '/premium'}
                                className="w-full text-center py-2 bg-neon-gold/15 hover:bg-neon-gold/30 border border-neon-gold/40 hover:border-neon-gold text-neon-gold font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold hover:scale-[1.01]"
                              >
                                UNLOCK WITH PRO
                              </button>
                            ) : (
                              <button
                                disabled={isEquipped}
                                onClick={() => handleEquipCosmetic('piece', piece.id)}
                                className={cn(
                                  "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold rounded-none",
                                  isEquipped 
                                    ? "bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan cursor-default"
                                    : "bg-slate-900/60 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white hover:bg-slate-800/80"
                                )}
                              >
                                {isEquipped ? 'Attuned' : 'Equip Pieces'}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Spell VFX Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Wand2 className="h-4 w-4 text-neon-purple" />
                    <h3 className="font-mono text-[10px] text-neon-purple tracking-widest uppercase font-bold">SPELL CASTING EFFECTS</h3>
                    <div className="flex-1 h-px bg-neon-purple opacity-15" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {spellEffects.map((spell) => {
                      const isEquipped = equippedSpell === spell.id
                      const isLocked = spell.premium && !isPro

                      return (
                        <motion.div 
                          key={spell.id}
                          whileHover={{ y: -3, scale: 1.01 }}
                          className={cn(
                            "p-5 border bg-[oklch(0.125_0.015_280)] flex flex-col justify-between min-h-[180px] relative transition-all duration-300 group rounded-none",
                            isEquipped ? 'border-neon-purple/80 glow-purple bg-[oklch(0.135_0.02_280)]' : 'border-slate-800/80 hover:border-slate-700',
                            spell.glow
                          )}
                        >
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/10 group-hover:border-foreground/20 transition-colors" />
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/10 group-hover:border-foreground/20 transition-colors" />

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start min-h-[18px]">
                              <span />
                              {isLocked ? (
                                <span className="text-neon-gold text-[7px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest animate-pulse-glow">
                                  <Lock className="h-2 w-2" /> PRO
                                </span>
                              ) : isEquipped ? (
                                <span className="text-neon-purple text-[7px] border border-neon-purple/40 bg-neon-purple/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest">
                                  EQUIPPED
                                </span>
                              ) : null}
                            </div>

                            <h4 className="font-sans text-[13px] font-bold text-slate-100 tracking-wide group-hover:text-neon-purple transition-colors duration-300">{spell.name}</h4>
                            <p className="font-sans text-[10px] text-slate-400/90 leading-relaxed mt-1.5 tracking-normal normal-case">{spell.desc.toLowerCase()}</p>
                          </div>

                          <div className="mt-4">
                            {isLocked ? (
                              <button
                                onClick={() => window.location.href = '/premium'}
                                className="w-full text-center py-2 bg-neon-gold/15 hover:bg-neon-gold/30 border border-neon-gold/40 hover:border-neon-gold text-neon-gold font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold hover:scale-[1.01]"
                              >
                                UNLOCK WITH PRO
                              </button>
                            ) : (
                              <button
                                disabled={isEquipped}
                                onClick={() => handleEquipCosmetic('spell', spell.id)}
                                className={cn(
                                  "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold rounded-none",
                                  isEquipped 
                                    ? "bg-neon-purple/10 border border-neon-purple/30 text-neon-purple cursor-default"
                                    : "bg-slate-900/60 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white hover:bg-slate-800/80"
                                )}
                              >
                                {isEquipped ? 'Attuned' : 'Equip VFX'}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: SPELLBOOK & PROGRESSION */}
            {activeTab === 'spellbook' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Progression stats */}
                <div className="lg:col-span-4 border border-border bg-gradient-to-b from-card/30 to-background/50 p-6 flex flex-col gap-6 items-center text-center relative justify-center min-h-[300px] group shadow-lg">
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/20" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/20" />
                  
                  <span className="font-mono text-[8px] text-muted-foreground tracking-widest uppercase absolute top-4">SUMMONER LEVEL STATUS</span>
                  
                  {/* Level Badge Circle */}
                  <div className="relative w-28 h-28 flex items-center justify-center border-2 border-dashed border-neon-cyan/30 rounded-full glow-cyan mt-6">
                    <div className="absolute w-[88%] h-[88%] border border-neon-cyan/10 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-title text-5xl text-neon-cyan text-glow-cyan leading-none font-bold mt-1" style={{ fontFamily: 'var(--font-jacquard)' }}>
                        {profile?.level ?? 1}
                      </span>
                      <span className="font-mono text-[6px] tracking-widest text-muted-foreground/60 uppercase font-bold mt-1">
                        LEVEL
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full flex flex-col gap-2 mt-2">
                    <div className="flex justify-between font-mono text-[8px] text-muted-foreground/80">
                      <span>{profile?.xp ? profile.xp % 1000 : 0} / 1000 XP</span>
                      <span>{xpNeeded} XP TO LEVEL { (profile?.level ?? 1) + 1 }</span>
                    </div>
                    <Progress value={xpProgress} className="h-2 bg-black border border-border/50 shrink-0" />
                  </div>
                  
                  <span className="font-mono text-[8px] text-neon-purple uppercase font-bold tracking-widest border border-neon-purple/20 bg-neon-purple/5 px-3 py-1 mt-1">
                    TOTAL EXPERIENCE: {profile?.xp ?? 0} XP
                  </span>

                </div>

                {/* Right: Achievements grids */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-neon-gold" />
                    <h3 className="font-mono text-[10px] text-neon-gold tracking-widest uppercase font-bold">SPELLBOOK TRIUMPHS (ACHIEVEMENTS)</h3>
                    <div className="flex-1 h-px bg-neon-gold opacity-15" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {standardAchievements.map((ach) => {
                      const unlocked = achievements?.some(a => a.name.toLowerCase() === ach.name.toLowerCase())
                      const Icon = ach.icon
                      return (
                        <motion.div 
                          key={ach.name}
                          whileHover={unlocked ? { y: -2, scale: 1.01 } : {}}
                          className={cn(
                            "p-4 border font-mono text-[9px] tracking-wider relative flex gap-4 items-center transition-all duration-300",
                            unlocked 
                              ? 'border-neon-gold/50 bg-gradient-to-r from-neon-gold/5 to-card/20 shadow-[0_0_15px_oklch(0.8_0.18_85/0.06)]' 
                              : 'border-border/60 bg-black/10 opacity-50'
                          )}
                        >
                          {/* Corner bracket */}
                          {unlocked && (
                            <>
                              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-neon-gold" />
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-neon-gold" />
                            </>
                          )}

                          {/* Trophy icon border */}
                          <div className={cn(
                            "w-10 h-10 shrink-0 flex items-center justify-center border transition-all duration-300",
                            unlocked ? 'border-neon-gold/40 bg-neon-gold/10 text-neon-gold glow-gold' : 'border-border text-muted-foreground/60'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex flex-col gap-0.5 leading-none">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn("font-bold text-[10px] tracking-wide", unlocked ? 'text-neon-gold' : 'text-foreground/80')}>{ach.name}</span>
                              {unlocked && (
                                <CheckCircle2 className="h-3 w-3 text-neon-cyan" />
                              )}
                            </div>
                            <span className="text-[8px] text-muted-foreground/75 uppercase mt-1 leading-normal tracking-wide">{ach.desc}</span>
                            <span className={cn("text-[7px] uppercase mt-1 tracking-wider font-bold", unlocked ? 'text-neon-cyan' : 'text-muted-foreground/40')}>
                              +{ach.xp} XP REWARD
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: ACCOUNT CONFIGS */}
            {activeTab === 'settings' && (
              <div className="max-w-md mx-auto border border-border bg-gradient-to-b from-card/30 to-background/50 p-6 sm:p-8 relative shadow-lg">
                
                {/* Neon Pink border accents */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-neon-pink" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-neon-pink" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-neon-pink" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-neon-pink" />

                <div className="flex flex-col gap-1 text-center border-b border-border pb-4 mb-6">
                  <Settings className="h-5 w-5 text-neon-pink mx-auto animate-spin" style={{ animationDuration: '6s' }} />
                  <h3 className="font-title text-2xl text-neon-pink text-glow-pink uppercase mt-2" style={{ fontFamily: 'var(--font-jacquard)' }}>SANCTUM PARAMETERS</h3>
                  <p className="font-mono text-[8px] text-muted-foreground/80 uppercase tracking-widest">Adjust username and guild location to join rankings</p>
                </div>

                <form onSubmit={handleUpdateProfileSubmit} className="flex flex-col gap-4 font-mono text-[9px] tracking-widest">
                  
                  {/* Username Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground/80 font-bold uppercase tracking-wider">SUMMONER NAME (USERNAME)</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="p-3 bg-black border border-border/80 text-[10px] text-foreground focus:outline-none focus:border-neon-pink transition-all font-mono hover:border-border-hover"
                    />
                  </div>

                  {/* City Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground/80 font-bold uppercase tracking-wider">GUILD LOCATION (CITY)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Astana, London, Tokyo"
                        className="w-full p-3 pl-8 bg-black border border-border/80 text-[10px] text-foreground focus:outline-none focus:border-neon-pink transition-all font-mono placeholder:text-muted-foreground/35 hover:border-border-hover"
                      />
                      <MapPin className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border border-neon-pink/20 bg-neon-pink/5 p-3.5 leading-relaxed text-neon-pink uppercase text-[8px] mt-1 tracking-wider">
                    <Crown className="h-4 w-4 shrink-0 animate-bounce text-neon-pink" />
                    <span>SPECIFYING A GUILD LOCATION ENABLES LOCALIZED RANKINGS FILTERING IN THE HALL OF MASTERS LEADERBOARD.</span>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 bg-neon-pink hover:bg-neon-pink/90 text-background font-sans font-bold text-[9px] sm:text-[10px] tracking-widest cursor-pointer active:scale-95 transition-all uppercase disabled:opacity-50 mt-2"
                    style={{
                      boxShadow: '0 0 20px oklch(0.7 0.22 330/0.4)'
                    }}
                  >
                    APPLY PARAMETER ATTUNEMENT
                  </button>

                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
