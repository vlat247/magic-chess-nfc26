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
  { id: 'classic', name: 'Classic Sanctum', desc: 'Default purple and dark fantasy squares.', premium: false, colorClass: 'border-white/10 text-zinc-300', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
  { id: 'neon-abyss', name: 'Neon Abyss', desc: 'Cyberpunk neon-purple glowing square matrix.', premium: true, colorClass: 'border-white/10 text-zinc-300', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
  { id: 'molten-core', name: 'Molten Core', desc: 'Fiery gold and glowing magma squares.', premium: true, colorClass: 'border-white/10 text-zinc-300', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
  { id: 'cosmic-void', name: 'Cosmic Void', desc: 'Nebula cosmic starfield and blue void tiles.', premium: true, colorClass: 'border-white/10 text-zinc-300', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
]

// Predefined Piece Styles
const pieceStyles = [
  { id: 'classic', name: 'Classic Chess', desc: 'Standard visual chess designs.', premium: false, colorClass: 'border-white/10 text-zinc-400', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
  { id: 'arcane-runes', name: 'Arcane Runes', desc: 'Glowing circular runic glyph engravings.', premium: true, colorClass: 'border-white/10 text-zinc-400', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
  { id: 'hologram', name: 'Hologram Vector', desc: 'Glowing wireframe vector grid styles.', premium: true, colorClass: 'border-white/10 text-zinc-400', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
]

// Predefined Spell Effects
const spellEffects = [
  { id: 'classic', name: 'Sparks & Fire', desc: 'Standard fireball and flame burst effects.', premium: false, colorClass: 'border-white/10 text-zinc-400', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
  { id: 'glacial-spike', name: 'Glacial Shatter', desc: 'Freezing ice crystals explosion.', premium: true, colorClass: 'border-white/10 text-zinc-400', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
  { id: 'void-implosion', name: 'Void Vortex', desc: 'Swirling dark hole implosions.', premium: true, colorClass: 'border-white/10 text-zinc-400', glow: 'border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/20' },
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
    { id: 'lobby', label: 'Duel Lobby', icon: Swords },
    { id: 'armory', label: 'Cosmetics Armory', icon: Sparkles },
    { id: 'spellbook', label: 'Spellbook Progression', icon: Wand2 },
    { id: 'settings', label: 'Sanctum Configs', icon: Settings },
  ] as const

  return (
    <div className="flex flex-col gap-6 w-full relative z-10">
      
      {/* ── INTERACTIVE TAB SELECTORS ────────────────────────────────────── */}
      <div 
        className="flex border-b border-white/[0.08] bg-zinc-950/20 backdrop-blur-md overflow-x-auto scrollbar-none font-mono text-[9px] tracking-widest relative rounded-t-xl"
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
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
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
                    <Sparkles className="h-4 w-4 text-amber-400/80" />
                    <h3 className="font-mono text-[10px] text-amber-400/80 tracking-widest uppercase font-bold">BOARD STYLES (THEMES)</h3>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {boardThemes.map((board) => {
                      const isEquipped = equippedBoard === board.id
                      const isLocked = board.premium && !isPro
                      
                      return (
                        <motion.div 
                          key={board.id}
                          whileHover={{ y: -3 }}
                          className={cn(
                            "p-5 border bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between min-h-[180px] relative transition-all duration-300 group rounded-xl",
                            isEquipped ? 'border-amber-500/40 bg-zinc-900/30' : 'border-white/[0.06] hover:border-white/20',
                            board.glow
                          )}
                        >
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-hover:border-white/20 transition-colors" />
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/10 group-hover:border-white/20 transition-colors" />

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start min-h-[18px]">
                              <span />
                              {isLocked ? (
                                <span className="text-amber-400 text-[7px] border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded">
                                  <Lock className="h-2 w-2" /> PRO
                                </span>
                              ) : isEquipped ? (
                                <span className="text-amber-400 text-[7px] border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded">
                                  EQUIPPED
                                </span>
                              ) : null}
                            </div>

                            <h4 className="font-sans text-[13px] font-bold text-zinc-100 tracking-wide group-hover:text-amber-400 transition-colors duration-300">{board.name}</h4>
                            <p className="font-sans text-[10px] text-zinc-400/90 leading-relaxed mt-1.5 tracking-normal normal-case">{board.desc.toLowerCase()}</p>
                          </div>

                          <div className="mt-4">
                            {isLocked ? (
                              <button
                                onClick={() => window.location.href = '/premium'}
                                className="w-full text-center py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-400 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold hover:scale-[1.01] rounded"
                              >
                                UNLOCK WITH PRO
                              </button>
                            ) : (
                              <button
                                disabled={isEquipped}
                                onClick={() => handleEquipCosmetic('board', board.id)}
                                className={cn(
                                  "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold rounded",
                                  isEquipped 
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-default"
                                    : "bg-zinc-900/60 border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
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
                    <Swords className="h-4 w-4 text-cyan-400/80" />
                    <h3 className="font-mono text-[10px] text-cyan-400/80 tracking-widest uppercase font-bold">PIECE ART DESIGN</h3>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {pieceStyles.map((piece) => {
                      const isEquipped = equippedPiece === piece.id
                      const isLocked = piece.premium && !isPro

                      return (
                        <motion.div 
                          key={piece.id}
                          whileHover={{ y: -3 }}
                          className={cn(
                            "p-5 border bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between min-h-[180px] relative transition-all duration-300 group rounded-xl",
                            isEquipped ? 'border-cyan-500/40 bg-zinc-900/30' : 'border-white/[0.06] hover:border-white/20',
                            piece.glow
                          )}
                        >
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-hover:border-white/20 transition-colors" />
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/10 group-hover:border-white/20 transition-colors" />

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start min-h-[18px]">
                              <span />
                              {isLocked ? (
                                <span className="text-amber-400 text-[7px] border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded">
                                  <Lock className="h-2 w-2" /> PRO
                                </span>
                              ) : isEquipped ? (
                                <span className="text-cyan-400 text-[7px] border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded">
                                  EQUIPPED
                                </span>
                              ) : null}
                            </div>

                            <h4 className="font-sans text-[13px] font-bold text-zinc-100 tracking-wide group-hover:text-cyan-400 transition-colors duration-300">{piece.name}</h4>
                            <p className="font-sans text-[10px] text-zinc-400/90 leading-relaxed mt-1.5 tracking-normal normal-case">{piece.desc.toLowerCase()}</p>
                          </div>

                          <div className="mt-4">
                            {isLocked ? (
                              <button
                                onClick={() => window.location.href = '/premium'}
                                className="w-full text-center py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-400 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold hover:scale-[1.01] rounded"
                              >
                                UNLOCK WITH PRO
                              </button>
                            ) : (
                              <button
                                disabled={isEquipped}
                                onClick={() => handleEquipCosmetic('piece', piece.id)}
                                className={cn(
                                  "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold rounded",
                                  isEquipped 
                                    ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 cursor-default"
                                    : "bg-zinc-900/60 border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
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
                    <Wand2 className="h-4 w-4 text-violet-400/80" />
                    <h3 className="font-mono text-[10px] text-violet-400/80 tracking-widest uppercase font-bold">SPELL CASTING EFFECTS</h3>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {spellEffects.map((spell) => {
                      const isEquipped = equippedSpell === spell.id
                      const isLocked = spell.premium && !isPro

                      return (
                        <motion.div 
                          key={spell.id}
                          whileHover={{ y: -3 }}
                          className={cn(
                            "p-5 border bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between min-h-[180px] relative transition-all duration-300 group rounded-xl",
                            isEquipped ? 'border-violet-500/40 bg-zinc-900/30' : 'border-white/[0.06] hover:border-white/20',
                            spell.glow
                          )}
                        >
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-hover:border-white/20 transition-colors" />
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/10 group-hover:border-white/20 transition-colors" />

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start min-h-[18px]">
                              <span />
                              {isLocked ? (
                                <span className="text-amber-400 text-[7px] border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded">
                                  <Lock className="h-2 w-2" /> PRO
                                </span>
                              ) : isEquipped ? (
                                <span className="text-violet-400 text-[7px] border border-violet-500/20 bg-violet-500/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded">
                                  EQUIPPED
                                </span>
                              ) : null}
                            </div>

                            <h4 className="font-sans text-[13px] font-bold text-zinc-100 tracking-wide group-hover:text-violet-400 transition-colors duration-300">{spell.name}</h4>
                            <p className="font-sans text-[10px] text-zinc-400/90 leading-relaxed mt-1.5 tracking-normal normal-case">{spell.desc.toLowerCase()}</p>
                          </div>

                          <div className="mt-4">
                            {isLocked ? (
                              <button
                                onClick={() => window.location.href = '/premium'}
                                className="w-full text-center py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-400 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold hover:scale-[1.01] rounded"
                              >
                                UNLOCK WITH PRO
                              </button>
                            ) : (
                              <button
                                disabled={isEquipped}
                                onClick={() => handleEquipCosmetic('spell', spell.id)}
                                className={cn(
                                  "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 font-bold rounded",
                                  isEquipped 
                                    ? "bg-violet-500/10 border border-violet-500/20 text-violet-400 cursor-default"
                                    : "bg-zinc-900/60 border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
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
                <div className="lg:col-span-4 border border-white/[0.08] bg-zinc-950/40 backdrop-blur-md p-6 flex flex-col gap-6 items-center text-center relative justify-center min-h-[300px] group rounded-xl shadow-md">
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/10" />
                  
                  <span className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase absolute top-4">SUMMONER LEVEL STATUS</span>
                  
                  {/* Level Badge Circle */}
                  <div className="relative w-28 h-28 flex items-center justify-center border border-white/[0.08] rounded-full mt-6 bg-zinc-900/30">
                    <div className="absolute w-[88%] h-[88%] border border-white/5 rounded-full border-dotted" />
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-5xl text-zinc-100 leading-none font-bold mt-1">
                        {profile?.level ?? 1}
                      </span>
                      <span className="font-mono text-[6px] tracking-widest text-zinc-500 uppercase font-bold mt-1">
                        LEVEL
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full flex flex-col gap-2 mt-2">
                    <div className="flex justify-between font-mono text-[8px] text-zinc-500">
                      <span>{profile?.xp ? profile.xp % 1000 : 0} / 1000 XP</span>
                      <span>{xpNeeded} XP TO LEVEL { (profile?.level ?? 1) + 1 }</span>
                    </div>
                    <Progress value={xpProgress} className="h-2 bg-zinc-950 border border-white/[0.06] shrink-0" />
                  </div>
                  
                  <span className="font-mono text-[8px] text-zinc-300 uppercase font-bold tracking-widest border border-white/[0.08] bg-zinc-900/50 px-3 py-1.5 mt-1 rounded">
                    TOTAL EXPERIENCE: {profile?.xp ?? 0} XP
                  </span>

                </div>

                {/* Right: Achievements grids */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-amber-400" />
                    <h3 className="font-mono text-[10px] text-amber-400/80 tracking-widest uppercase font-bold">SPELLBOOK TRIUMPHS (ACHIEVEMENTS)</h3>
                    <div className="flex-1 h-px bg-white/[0.06]" />
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
                            "p-4 border font-mono text-[9px] tracking-wider relative flex gap-4 items-center transition-all duration-300 rounded-xl",
                            unlocked 
                              ? 'border-amber-500/30 bg-zinc-900/20 shadow-sm' 
                              : 'border-white/[0.04] bg-zinc-950/20 opacity-40 shadow-none'
                          )}
                        >
                          {/* Corner bracket */}
                          {unlocked && (
                            <>
                              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-500/40" />
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-500/40" />
                            </>
                          )}

                          {/* Trophy icon border */}
                          <div className={cn(
                            "w-10 h-10 shrink-0 flex items-center justify-center border transition-all duration-300 rounded-lg",
                            unlocked ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' : 'border-white/[0.08] text-zinc-600 bg-zinc-950'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex flex-col gap-0.5 leading-none">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn("font-bold text-[10px] tracking-wide", unlocked ? 'text-amber-200' : 'text-zinc-500')}>{ach.name}</span>
                              {unlocked && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              )}
                            </div>
                            <span className="text-[8px] text-zinc-400 mt-1 leading-normal tracking-wide">{ach.desc}</span>
                            <span className={cn("text-[7px] uppercase mt-1 tracking-wider font-bold", unlocked ? 'text-zinc-300' : 'text-zinc-600')}>
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
              <div className="max-w-md mx-auto border border-white/[0.08] bg-zinc-950/40 backdrop-blur-md p-6 sm:p-8 relative rounded-xl shadow-lg">
                
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/20 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/20 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/20 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/20 rounded-br-lg" />

                <div className="flex flex-col gap-1 text-center border-b border-white/[0.06] pb-4 mb-6">
                  <Settings className="h-5 w-5 text-zinc-400 mx-auto animate-spin" style={{ animationDuration: '6s' }} />
                  <h3 className="font-mono text-xs text-white uppercase tracking-widest mt-2 font-bold">SANCTUM PARAMETERS</h3>
                  <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest mt-1">Adjust username and guild location to join rankings</p>
                </div>

                <form onSubmit={handleUpdateProfileSubmit} className="flex flex-col gap-4 font-mono text-[9px] tracking-widest">
                  
                  {/* Username Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">SUMMONER NAME (USERNAME)</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="p-3 bg-zinc-900/50 border border-white/[0.08] text-[10px] text-white focus:outline-none focus:border-white/20 transition-all font-mono hover:border-white/10 rounded"
                    />
                  </div>

                  {/* City Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider">GUILD LOCATION (CITY)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Astana, London, Tokyo"
                        className="w-full p-3 pl-8 bg-zinc-900/50 border border-white/[0.08] text-[10px] text-white focus:outline-none focus:border-white/20 transition-all font-mono placeholder:text-zinc-600 hover:border-white/10 rounded"
                      />
                      <MapPin className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-zinc-500" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border border-white/[0.08] bg-zinc-900/30 p-3.5 leading-relaxed text-zinc-400 uppercase text-[8px] mt-1 tracking-wider rounded">
                    <Crown className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>SPECIFYING A GUILD LOCATION ENABLES LOCALIZED RANKINGS FILTERING IN THE HALL OF MASTERS LEADERBOARD.</span>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-[9px] sm:text-[10px] tracking-widest cursor-pointer active:scale-[0.98] transition-all uppercase disabled:opacity-50 mt-2 rounded"
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
