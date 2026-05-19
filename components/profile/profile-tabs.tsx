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
  const [armoryTab, setArmoryTab] = useState<'board' | 'piece' | 'spell'>('board')
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
        className="flex border-b-2 border-[#2D3748] bg-[#2D3748]/30 backdrop-blur-md overflow-x-auto scrollbar-none font-mono text-[9px] tracking-widest relative rounded-none"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-300 uppercase flex items-center gap-2 shrink-0 relative rounded-none",
                isActive
                  ? "border-[#BFC7D5] text-[#BFC7D5] bg-[#BFC7D5]/5"
                  : "border-transparent text-[#8D99AE] hover:text-[#BFC7D5] hover:bg-[#2D3748]/20"
              )}
            >
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
              <div className="flex flex-col gap-6">
                
                {/* Armory Category Sub-Tabs */}
                <div className="flex border-b border-[#2D3748] bg-[#2D3748]/10 backdrop-blur-md rounded-none font-mono text-[8px] tracking-widest uppercase">
                  {([
                    { key: 'board' as const, label: 'Board Themes', icon: <Sparkles className="h-3 w-3" /> },
                    { key: 'piece' as const, label: 'Piece Art', icon: <Swords className="h-3 w-3" /> },
                    { key: 'spell' as const, label: 'Spell Casting VFX', icon: <Wand2 className="h-3 w-3" /> },
                  ]).map((tab) => {
                    const isActive = armoryTab === tab.key
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setArmoryTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-bold cursor-pointer transition-all duration-200 relative uppercase rounded-none
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

                {/* Sub-tab items grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {armoryTab === 'board' && boardThemes.map((board) => {
                    const isEquipped = equippedBoard === board.id
                    const isLocked = board.premium && !isPro
                    
                    return (
                      <div 
                        key={board.id}
                        className={cn(
                          "p-4 border bg-[#1E2530]/40 flex flex-col justify-between min-h-[150px] relative transition-all duration-200 group rounded-none",
                          isEquipped ? 'pixel-border-yellow' : 'pixel-border-gunmetal hover:pixel-border-silver'
                        )}
                      >
                        {/* Corner markers for equipped */}
                        {isEquipped && (
                          <>
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#FACC15]" />
                          </>
                        )}

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start min-h-[16px]">
                            <span className="font-mono text-[8px] tracking-wider text-[#8D99AE] uppercase font-bold">BOARD THEME</span>
                            {isLocked ? (
                              <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none">
                                <Lock className="h-2 w-2" /> PRO
                              </span>
                            ) : isEquipped ? (
                              <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none font-bold">
                                EQUIPPED
                              </span>
                            ) : null}
                          </div>

                          <h4 className="font-mono text-[11px] font-bold text-zinc-100 uppercase tracking-wider group-hover:text-[#BFC7D5] transition-colors">{board.name}</h4>
                          <p className="font-sans text-[9px] text-[#8D99AE] leading-normal tracking-wide lowercase">{board.desc}</p>
                        </div>

                        <div className="mt-4">
                          {isLocked ? (
                            <button
                              onClick={() => window.location.href = '/premium'}
                              className="w-full text-center py-2 bg-[#2D3748] hover:bg-[#4A5568] border-2 border-zinc-950 text-[#BFC7D5] font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all rounded-none shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] font-bold"
                            >
                              UNLOCK PRO SKIN
                            </button>
                          ) : (
                            <button
                              disabled={isEquipped}
                              onClick={() => handleEquipCosmetic('board', board.id)}
                              className={cn(
                                "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase transition-all font-bold rounded-none border-2 border-zinc-950",
                                isEquipped 
                                  ? "bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/30 cursor-default"
                                  : "bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]"
                              )}
                            >
                              {isEquipped ? 'ATTUNED' : 'EQUIP THEME'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {armoryTab === 'piece' && pieceStyles.map((piece) => {
                    const isEquipped = equippedPiece === piece.id
                    const isLocked = piece.premium && !isPro

                    return (
                      <div 
                        key={piece.id}
                        className={cn(
                          "p-4 border bg-[#1E2530]/40 flex flex-col justify-between min-h-[150px] relative transition-all duration-200 group rounded-none",
                          isEquipped ? 'pixel-border-yellow' : 'pixel-border-gunmetal hover:pixel-border-silver'
                        )}
                      >
                        {/* Corner markers for equipped */}
                        {isEquipped && (
                          <>
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#FACC15]" />
                          </>
                        )}

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start min-h-[16px]">
                            <span className="font-mono text-[8px] tracking-wider text-[#8D99AE] uppercase font-bold">PIECE DESIGN</span>
                            {isLocked ? (
                              <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none">
                                <Lock className="h-2 w-2" /> PRO
                              </span>
                            ) : isEquipped ? (
                              <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none font-bold">
                                EQUIPPED
                              </span>
                            ) : null}
                          </div>

                          <h4 className="font-mono text-[11px] font-bold text-zinc-100 uppercase tracking-wider group-hover:text-[#BFC7D5] transition-colors">{piece.name}</h4>
                          <p className="font-sans text-[9px] text-[#8D99AE] leading-normal tracking-wide lowercase">{piece.desc}</p>
                        </div>

                        <div className="mt-4">
                          {isLocked ? (
                            <button
                              onClick={() => window.location.href = '/premium'}
                              className="w-full text-center py-2 bg-[#2D3748] hover:bg-[#4A5568] border-2 border-zinc-950 text-[#BFC7D5] font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all rounded-none shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] font-bold"
                            >
                              UNLOCK PRO SKIN
                            </button>
                          ) : (
                            <button
                              disabled={isEquipped}
                              onClick={() => handleEquipCosmetic('piece', piece.id)}
                              className={cn(
                                "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase transition-all font-bold rounded-none border-2 border-zinc-950",
                                isEquipped 
                                  ? "bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/30 cursor-default"
                                  : "bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]"
                              )}
                            >
                              {isEquipped ? 'ATTUNED' : 'EQUIP PIECES'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {armoryTab === 'spell' && spellEffects.map((spell) => {
                    const isEquipped = equippedSpell === spell.id
                    const isLocked = spell.premium && !isPro

                    return (
                      <div 
                        key={spell.id}
                        className={cn(
                          "p-4 border bg-[#1E2530]/40 flex flex-col justify-between min-h-[150px] relative transition-all duration-200 group rounded-none",
                          isEquipped ? 'pixel-border-yellow' : 'pixel-border-gunmetal hover:pixel-border-silver'
                        )}
                      >
                        {/* Corner markers for equipped */}
                        {isEquipped && (
                          <>
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#FACC15]" />
                            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#FACC15]" />
                          </>
                        )}

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start min-h-[16px]">
                            <span className="font-mono text-[8px] tracking-wider text-[#8D99AE] uppercase font-bold">SPELL EFFECT</span>
                            {isLocked ? (
                              <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none">
                                <Lock className="h-2 w-2" /> PRO
                              </span>
                            ) : isEquipped ? (
                              <span className="text-[#FACC15] text-[7px] border border-[#FACC15]/20 bg-[#FACC15]/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold tracking-widest rounded-none font-bold">
                                EQUIPPED
                              </span>
                            ) : null}
                          </div>

                          <h4 className="font-mono text-[11px] font-bold text-zinc-100 uppercase tracking-wider group-hover:text-[#BFC7D5] transition-colors">{spell.name}</h4>
                          <p className="font-sans text-[9px] text-[#8D99AE] leading-normal tracking-wide lowercase">{spell.desc}</p>
                        </div>

                        <div className="mt-4">
                          {isLocked ? (
                            <button
                              onClick={() => window.location.href = '/premium'}
                              className="w-full text-center py-2 bg-[#2D3748] hover:bg-[#4A5568] border-2 border-zinc-950 text-[#BFC7D5] font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all rounded-none shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] font-bold"
                            >
                              UNLOCK PRO SKIN
                            </button>
                          ) : (
                            <button
                              disabled={isEquipped}
                              onClick={() => handleEquipCosmetic('spell', spell.id)}
                              className={cn(
                                "w-full text-center py-2 font-mono text-[8px] tracking-widest uppercase transition-all font-bold rounded-none border-2 border-zinc-950",
                                isEquipped 
                                  ? "bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/30 cursor-default"
                                  : "bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]"
                              )}
                            >
                              {isEquipped ? 'ATTUNED' : 'EQUIP VFX'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
            )}

            {/* TAB 3: SPELLBOOK & PROGRESSION */}
            {activeTab === 'spellbook' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Progression stats */}
                <div className="lg:col-span-4 border-2 pixel-border-steel bg-[#1E2530]/40 backdrop-blur-md p-6 flex flex-col gap-6 items-center text-center relative justify-center min-h-[300px] group rounded-none shadow-md">
                  <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#8D99AE]/40" />
                  <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#8D99AE]/40" />
                  <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-[#8D99AE]/40" />
                  <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-[#8D99AE]/40" />
                  
                  <span className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase absolute top-4">SUMMONER LEVEL STATUS</span>
                  
                  {/* Level Badge Block */}
                  <div className="relative w-28 h-28 flex items-center justify-center border-2 border-[#4A5568] bg-[#1E2530] rounded-none mt-6 shadow-[4px_4px_0px_#000000]">
                    <div className="absolute w-[88%] h-[88%] border border-[#4A5568]/40 rounded-none border-dotted" />
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-5xl text-[#BFC7D5] leading-none font-bold mt-1">
                        {profile?.level ?? 1}
                      </span>
                      <span className="font-mono text-[6px] tracking-widest text-[#8D99AE] uppercase font-bold mt-1">
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
                    <Progress value={xpProgress} className="h-2 bg-[#1E2530] border border-[#4A5568] shrink-0 rounded-none" />
                  </div>
                  
                  <span className="font-mono text-[8px] text-[#BFC7D5] uppercase font-bold tracking-widest border-2 border-[#4A5568] bg-[#2D3748]/50 px-3 py-1.5 mt-1 rounded-none">
                    TOTAL EXPERIENCE: {profile?.xp ?? 0} XP
                  </span>

                </div>

                {/* Right: Achievements grids */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-[#FACC15]" />
                    <h3 className="font-mono text-[10px] text-[#FACC15] tracking-widest uppercase font-bold">SPELLBOOK TRIUMPHS (ACHIEVEMENTS)</h3>
                    <div className="flex-1 h-px bg-[#4A5568]/40" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {standardAchievements.map((ach) => {
                      const unlocked = achievements?.some(a => a.name.toLowerCase() === ach.name.toLowerCase())
                      const Icon = ach.icon
                      return (
                        <div 
                          key={ach.name}
                          className={cn(
                            "p-4 border-2 font-mono text-[9px] tracking-wider relative flex gap-4 items-center transition-all duration-300 rounded-none",
                            unlocked 
                              ? 'border-[#FACC15] bg-[#FACC15]/5 shadow-[2px_2px_0px_#000000]' 
                              : 'border-[#4A5568] bg-[#1E2530]/20 opacity-40 shadow-none'
                          )}
                        >
                          {/* Corner notched indicators for unlocked achievements */}
                          {unlocked && (
                            <>
                              <div className="absolute top-1 left-1 w-1 h-1 bg-[#FACC15]" />
                              <div className="absolute top-1 right-1 w-1 h-1 bg-[#FACC15]" />
                              <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#FACC15]" />
                              <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#FACC15]" />
                            </>
                          )}

                          {/* Icon border */}
                          <div className={cn(
                            "w-10 h-10 shrink-0 flex items-center justify-center border-2 transition-all duration-300 rounded-none",
                            unlocked ? 'border-[#FACC15]/40 bg-[#FACC15]/5 text-[#FACC15]' : 'border-[#4A5568] text-zinc-650 bg-zinc-950'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex flex-col gap-0.5 leading-none">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn("font-bold text-[10px] tracking-wide uppercase", unlocked ? 'text-zinc-100' : 'text-[#8D99AE]')}>{ach.name}</span>
                              {unlocked && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              )}
                            </div>
                            <span className="text-[8px] text-[#8D99AE] mt-1 leading-normal tracking-wide lowercase">{ach.desc}</span>
                            <span className={cn("text-[7px] uppercase mt-1 tracking-wider font-bold", unlocked ? 'text-[#BFC7D5]' : 'text-[#4A5568]')}>
                              +{ach.xp} XP REWARD
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: ACCOUNT CONFIGS */}
            {activeTab === 'settings' && (
              <div className="max-w-md mx-auto border-2 pixel-border-steel bg-[#1E2530]/40 backdrop-blur-md p-6 sm:p-8 relative rounded-none shadow-lg">
                
                {/* Corner accents */}
                <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#8D99AE]/40" />
                <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#8D99AE]/40" />
                <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-[#8D99AE]/40" />
                <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-[#8D99AE]/40" />

                <div className="flex flex-col gap-1 text-center border-b border-[#4A5568]/40 pb-4 mb-6">
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
                      className="p-3 bg-[#1E2530] border-2 border-[#4A5568] text-[10px] text-white focus:outline-none focus:border-[#8D99AE] hover:border-[#8D99AE] transition-all font-mono placeholder:text-[#4A5568] rounded-none"
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
                        className="w-full p-3 pl-8 bg-[#1E2530] border-2 border-[#4A5568] text-[10px] text-white focus:outline-none focus:border-[#8D99AE] hover:border-[#8D99AE] transition-all font-mono placeholder:text-[#4A5568] rounded-none"
                      />
                      <MapPin className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-[#4A5568]" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-2 border-[#4A5568] bg-[#2D3748]/30 p-3.5 leading-relaxed text-[#8D99AE] uppercase text-[8px] mt-1 tracking-wider rounded-none">
                    <Crown className="h-4 w-4 shrink-0 text-[#FACC15]" />
                    <span>SPECIFYING A GUILD LOCATION ENABLES LOCALIZED RANKINGS FILTERING IN THE HALL OF MASTERS LEADERBOARD.</span>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 font-mono font-bold text-[9px] sm:text-[10px] tracking-widest cursor-pointer transition-all uppercase disabled:opacity-50 mt-2 rounded-none border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]"
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
