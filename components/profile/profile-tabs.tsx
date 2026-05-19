'use client'

import React, { useState, useTransition } from 'react'
import { equipCosmetic } from '@/actions/cosmetics'
import { updateSummonerProfile } from '@/actions/profile'
import { GameModeHub } from '@/components/multiplayer/game-mode-hub'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import {
  Swords, Sparkles, Trophy, Settings, ShieldCheck, Flame, 
  MapPin, Wand2, Zap, Star, Shield, Lock, CheckCircle2, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileTabsProps {
  userId: string
  profile: any
  matches: any[]
  achievements: any[]
  isPro: boolean
}

// Predefined Board Themes
const boardThemes = [
  { id: 'classic', name: 'Classic Sanctum', desc: 'Default purple and dark fantasy squares.', premium: false, colors: 'from-purple-950/20 to-zinc-950/40 border-purple-500/20' },
  { id: 'neon-abyss', name: 'Neon Abyss', desc: 'Cyberpunk neon-purple glowing square matrix.', premium: true, colors: 'from-fuchsia-950/30 to-violet-950/40 border-fuchsia-500/40 glow-purple' },
  { id: 'molten-core', name: 'Molten Core', desc: 'Fiery gold and glowing magma squares.', premium: true, colors: 'from-amber-950/30 to-orange-950/40 border-amber-500/40 glow-gold' },
  { id: 'cosmic-void', name: 'Cosmic Void', desc: 'Nebula cosmic starfield and blue void tiles.', premium: true, colors: 'from-cyan-950/30 to-blue-950/40 border-cyan-500/40 glow-cyan' },
]

// Predefined Piece Styles
const pieceStyles = [
  { id: 'classic', name: 'Classic Chess', desc: 'Standard visual chess designs.', premium: false, colors: 'from-zinc-900 to-zinc-950 border-zinc-500/20' },
  { id: 'arcane-runes', name: 'Arcane Runes', desc: 'Glowing circular runic glyph engravings.', premium: true, colors: 'from-yellow-950/30 to-zinc-950 border-yellow-500/40 glow-gold' },
  { id: 'hologram', name: 'Hologram Vector', desc: 'Glowing wireframe vector grid styles.', premium: true, colors: 'from-cyan-950/30 to-zinc-950 border-cyan-500/40 glow-cyan' },
]

// Predefined Spell Effects
const spellEffects = [
  { id: 'classic', name: 'Sparks & Fire', desc: 'Standard fireball and flame burst effects.', premium: false },
  { id: 'glacial-spike', name: 'Glacial Shatter', desc: 'Freezing ice crystals explosion.', premium: true },
  { id: 'void-implosion', name: 'Void Vortex', desc: 'Swirling dark hole implosions.', premium: true },
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
          description: `Successfully attired the ${skinId.replace('-', ' ')} theme.`
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

  return (
    <div className="flex flex-col gap-6 w-full relative z-10">
      
      {/* ── INTERACTIVE TAB SELECTORS ────────────────────────────────────── */}
      <div 
        className="flex border-b border-[oklch(0.2_0.04_280)] bg-[oklch(0.08_0.02_280)] overflow-x-auto scrollbar-none font-mono text-[10px] tracking-widest"
      >
        <button
          onClick={() => setActiveTab('lobby')}
          className={cn(
            "px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-200 uppercase flex items-center gap-2",
            activeTab === 'lobby'
              ? "border-neon-purple text-neon-purple text-glow-purple"
              : "border-transparent text-muted-foreground hover:text-foreground/80"
          )}
        >
          <Swords className="h-4 w-4" />
          DUEL LOBBY
        </button>

        <button
          onClick={() => setActiveTab('armory')}
          className={cn(
            "px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-200 uppercase flex items-center gap-2",
            activeTab === 'armory'
              ? "border-neon-gold text-neon-gold text-glow-gold"
              : "border-transparent text-muted-foreground hover:text-foreground/80"
          )}
        >
          <Sparkles className="h-4 w-4" />
          COSMETICS ARMORY
        </button>

        <button
          onClick={() => setActiveTab('spellbook')}
          className={cn(
            "px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-200 uppercase flex items-center gap-2",
            activeTab === 'spellbook'
              ? "border-neon-cyan text-neon-cyan text-glow-cyan"
              : "border-transparent text-muted-foreground hover:text-foreground/80"
          )}
        >
          <Wand2 className="h-4 w-4" />
          SPELLBOOK (XP)
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-200 uppercase flex items-center gap-2",
            activeTab === 'settings'
              ? "border-neon-pink text-neon-pink text-glow-pink"
              : "border-transparent text-muted-foreground hover:text-foreground/80"
          )}
        >
          <Settings className="h-4 w-4" />
          SANCTUM CONFIGS
        </button>
      </div>

      {/* ── TAB WORKSPACES ───────────────────────────────────────────────── */}
      <div className="w-full">
        
        {/* TAB 1: DUEL LOBBY */}
        {activeTab === 'lobby' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Renders existing GameModeHub */}
            <GameModeHub userId={userId} username={profile?.username ?? 'Mage'} />
          </div>
        )}

        {/* TAB 2: COSMETICS ARMORY */}
        {activeTab === 'armory' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            
            {/* Board Themes Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="h-3.5 w-3.5 text-neon-gold" />
                <h3 className="font-mono text-xs text-neon-gold tracking-widest uppercase">BOARD STYLES (THEMES)</h3>
                <div className="flex-1 h-px bg-neon-gold opacity-20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {boardThemes.map((board) => {
                  const isEquipped = equippedBoard === board.id
                  const isLocked = board.premium && !isPro
                  
                  return (
                    <div 
                      key={board.id}
                      className={cn(
                        "p-4 border bg-[oklch(0.09_0.02_280)] flex flex-col justify-between min-h-[170px] relative transition-all duration-300",
                        isEquipped ? 'border-neon-gold glow-gold' : 'border-[oklch(0.2_0.04_280)]'
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[9px] text-muted-foreground uppercase">BOARD SKIN</span>
                          {isLocked ? (
                            <span className="text-neon-gold text-[8px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase">
                              <Lock className="h-2 w-2" /> PRO
                            </span>
                          ) : isEquipped ? (
                            <span className="text-neon-cyan text-[8px] border border-neon-cyan/40 bg-neon-cyan/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold">
                              EQUIPPED
                            </span>
                          ) : null}
                        </div>

                        <h4 className="font-sans text-[11px] font-bold text-foreground mt-1 truncate">{board.name}</h4>
                        <p className="font-mono text-[8px] text-muted-foreground leading-relaxed mt-1 uppercase">{board.desc}</p>
                      </div>

                      <div className="mt-4">
                        {isLocked ? (
                          <button
                            onClick={() => window.location.href = '/premium'}
                            className="w-full text-center py-2 bg-neon-gold/10 hover:bg-neon-gold/25 border border-neon-gold/30 text-neon-gold font-sans text-[8px] tracking-widest uppercase cursor-pointer"
                          >
                            UNLOCK WITH PRO
                          </button>
                        ) : (
                          <button
                            disabled={isEquipped}
                            onClick={() => handleEquipCosmetic('board', board.id)}
                            className={cn(
                              "w-full text-center py-2 font-sans text-[8px] tracking-widest uppercase cursor-pointer transition-colors",
                              isEquipped 
                                ? "bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan cursor-default"
                                : "bg-[oklch(0.13_0.04_280)] border border-[oklch(0.35_0.08_280)] hover:border-neon-gold text-foreground/80 hover:text-neon-gold"
                            )}
                          >
                            {isEquipped ? 'Attuned' : 'Equip Theme'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Piece Customizer Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Swords className="h-3.5 w-3.5 text-neon-cyan" />
                <h3 className="font-mono text-xs text-neon-cyan tracking-widest uppercase">PIECE ART DESIGN</h3>
                <div className="flex-1 h-px bg-neon-cyan opacity-20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pieceStyles.map((piece) => {
                  const isEquipped = equippedPiece === piece.id
                  const isLocked = piece.premium && !isPro

                  return (
                    <div 
                      key={piece.id}
                      className={cn(
                        "p-4 border bg-[oklch(0.09_0.02_280)] flex flex-col justify-between min-h-[170px] relative transition-all duration-300",
                        isEquipped ? 'border-neon-cyan glow-cyan' : 'border-[oklch(0.2_0.04_280)]'
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[9px] text-muted-foreground uppercase">PIECE ART</span>
                          {isLocked ? (
                            <span className="text-neon-gold text-[8px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase">
                              <Lock className="h-2 w-2" /> PRO
                            </span>
                          ) : isEquipped ? (
                            <span className="text-neon-cyan text-[8px] border border-neon-cyan/40 bg-neon-cyan/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold">
                              EQUIPPED
                            </span>
                          ) : null}
                        </div>

                        <h4 className="font-sans text-[11px] font-bold text-foreground mt-1 truncate">{piece.name}</h4>
                        <p className="font-mono text-[8px] text-muted-foreground leading-relaxed mt-1 uppercase">{piece.desc}</p>
                      </div>

                      <div className="mt-4">
                        {isLocked ? (
                          <button
                            onClick={() => window.location.href = '/premium'}
                            className="w-full text-center py-2 bg-neon-gold/10 hover:bg-neon-gold/25 border border-neon-gold/30 text-neon-gold font-sans text-[8px] tracking-widest uppercase cursor-pointer"
                          >
                            UNLOCK WITH PRO
                          </button>
                        ) : (
                          <button
                            disabled={isEquipped}
                            onClick={() => handleEquipCosmetic('piece', piece.id)}
                            className={cn(
                              "w-full text-center py-2 font-sans text-[8px] tracking-widest uppercase cursor-pointer transition-colors",
                              isEquipped 
                                ? "bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan cursor-default"
                                : "bg-[oklch(0.13_0.04_280)] border border-[oklch(0.35_0.08_280)] hover:border-neon-cyan text-foreground/80 hover:text-neon-cyan"
                            )}
                          >
                            {isEquipped ? 'Attuned' : 'Equip Pieces'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Spell VFX Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Wand2 className="h-3.5 w-3.5 text-neon-purple" />
                <h3 className="font-mono text-xs text-neon-purple tracking-widest uppercase">SPELL CASTING EFFECTS</h3>
                <div className="flex-1 h-px bg-neon-purple opacity-20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {spellEffects.map((spell) => {
                  const isEquipped = equippedSpell === spell.id
                  const isLocked = spell.premium && !isPro

                  return (
                    <div 
                      key={spell.id}
                      className={cn(
                        "p-4 border bg-[oklch(0.09_0.02_280)] flex flex-col justify-between min-h-[170px] relative transition-all duration-300",
                        isEquipped ? 'border-neon-purple glow-purple' : 'border-[oklch(0.2_0.04_280)]'
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[9px] text-muted-foreground uppercase">SPELL VFX</span>
                          {isLocked ? (
                            <span className="text-neon-gold text-[8px] border border-neon-gold/30 bg-neon-gold/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase">
                              <Lock className="h-2 w-2" /> PRO
                            </span>
                          ) : isEquipped ? (
                            <span className="text-neon-cyan text-[8px] border border-neon-cyan/40 bg-neon-cyan/5 px-2 py-0.5 flex items-center gap-1 font-mono uppercase font-bold">
                              EQUIPPED
                            </span>
                          ) : null}
                        </div>

                        <h4 className="font-sans text-[11px] font-bold text-foreground mt-1 truncate">{spell.name}</h4>
                        <p className="font-mono text-[8px] text-muted-foreground leading-relaxed mt-1 uppercase">{spell.desc}</p>
                      </div>

                      <div className="mt-4">
                        {isLocked ? (
                          <button
                            onClick={() => window.location.href = '/premium'}
                            className="w-full text-center py-2 bg-neon-gold/10 hover:bg-neon-gold/25 border border-neon-gold/30 text-neon-gold font-sans text-[8px] tracking-widest uppercase cursor-pointer"
                          >
                            UNLOCK WITH PRO
                          </button>
                        ) : (
                          <button
                            disabled={isEquipped}
                            onClick={() => handleEquipCosmetic('spell', spell.id)}
                            className={cn(
                              "w-full text-center py-2 font-sans text-[8px] tracking-widest uppercase cursor-pointer transition-colors",
                              isEquipped 
                                ? "bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan cursor-default"
                                : "bg-[oklch(0.13_0.04_280)] border border-[oklch(0.35_0.08_280)] hover:border-neon-purple text-foreground/80 hover:text-neon-purple"
                            )}
                          >
                            {isEquipped ? 'Attuned' : 'Equip VFX'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: SPELLBOOK & PROGRESSION */}
        {activeTab === 'spellbook' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-200">
            
            {/* Left: Progression stats */}
            <div className="md:col-span-4 border border-[oklch(0.2_0.04_280)] bg-[oklch(0.08_0.02_280)] p-6 flex flex-col gap-6 items-center text-center relative justify-center min-h-[300px]">
              
              <span className="font-mono text-[8px] text-muted-foreground tracking-widest uppercase absolute top-4">SUMMONER LEVEL STATUS</span>
              
              {/* Level Badge Circle */}
              <div className="relative w-24 h-24 flex items-center justify-center border-2 border-dashed border-neon-cyan/40 rounded-full glow-cyan mt-4">
                <div className="absolute w-[85%] h-[85%] border border-neon-cyan/10 rounded-full animate-spin" />
                <div className="flex flex-col items-center justify-center">
                  <span className="font-title text-4xl text-neon-cyan text-glow-cyan leading-none font-bold">
                    {profile?.level ?? 1}
                  </span>
                  <span className="font-mono text-[6px] tracking-widest text-muted-foreground uppercase">
                    LEVEL
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between font-mono text-[8px] text-muted-foreground">
                  <span>{profile?.xp ? profile.xp % 1000 : 0} / 1000 XP</span>
                  <span>{xpNeeded} XP TO LEVEL { (profile?.level ?? 1) + 1 }</span>
                </div>
                <Progress value={xpProgress} className="h-2 bg-zinc-950 border border-[oklch(0.2_0.04_280)] shrink-0" />
              </div>
              
              <span className="font-mono text-[7px] text-neon-purple uppercase mt-2">
                TOTAL EXPERIENCE: {profile?.xp ?? 0} XP
              </span>

            </div>

            {/* Right: Achievements grids */}
            <div className="md:col-span-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-neon-gold" />
                <h3 className="font-mono text-xs text-neon-gold tracking-widest uppercase">SPELLBOOK TRIUMPHS (ACHIEVEMENTS)</h3>
                <div className="flex-1 h-px bg-neon-gold opacity-20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {standardAchievements.map((ach) => {
                  // Check if this achievement name is present in our unlocked achievements
                  const unlocked = achievements?.some(a => a.name.toLowerCase() === ach.name.toLowerCase())
                  
                  return (
                    <div 
                      key={ach.name}
                      className={cn(
                        "p-4 border font-mono text-[9px] tracking-wider relative flex gap-3.5 items-center transition-all duration-300",
                        unlocked 
                          ? 'border-neon-gold bg-neon-gold/5 shadow-[0_0_15px_oklch(0.8_0.18_85/0.05)]' 
                          : 'border-[oklch(0.2_0.04_280)] bg-black/10 opacity-60'
                      )}
                    >
                      {/* Trophy icon border */}
                      <div className={cn(
                        "w-10 h-10 shrink-0 flex items-center justify-center border",
                        unlocked ? 'border-neon-gold bg-neon-gold/10 text-neon-gold glow-gold' : 'border-zinc-800 text-muted-foreground'
                      )}>
                        <ach.icon className="h-5 w-5" />
                      </div>

                      <div className="flex flex-col gap-0.5 leading-none">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("font-bold text-[10px]", unlocked ? 'text-neon-gold' : 'text-foreground/80')}>{ach.name}</span>
                          {unlocked && (
                            <CheckCircle2 className="h-3 w-3 text-neon-cyan" />
                          )}
                        </div>
                        <span className="text-[8px] text-muted-foreground/80 uppercase mt-0.5 leading-normal">{ach.desc}</span>
                        <span className={cn("text-[7px] uppercase mt-1", unlocked ? 'text-neon-cyan font-bold' : 'text-muted-foreground/40')}>
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
          <div className="max-w-md mx-auto border border-[oklch(0.2_0.04_280)] bg-[oklch(0.08_0.02_280)] p-6 sm:p-8 animate-in fade-in duration-200 relative">
            
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-neon-pink" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-pink" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-neon-pink" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-neon-pink" />

            <div className="flex flex-col gap-1 text-center border-b border-[oklch(0.2_0.04_280)] pb-4 mb-6">
              <Settings className="h-5 w-5 text-neon-pink mx-auto animate-spin" style={{ animationDuration: '6s' }} />
              <h3 className="font-title text-xl text-neon-pink text-glow-pink uppercase mt-2">SANCTUM PARAMETERS</h3>
              <p className="font-mono text-[7px] text-muted-foreground uppercase tracking-widest">Adjust username and guild location to join rankings</p>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="flex flex-col gap-4 font-mono text-[9px] tracking-widest">
              
              {/* Username Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground uppercase">SUMMONER NAME (USERNAME)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="p-3 bg-[oklch(0.06_0.02_280)] border border-[oklch(0.25_0.05_280)] text-[10px] text-foreground focus:outline-none focus:border-neon-pink transition-colors font-mono"
                />
              </div>

              {/* City Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground uppercase">GUILD LOCATION (CITY)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Astana, London, San Francisco"
                    className="w-full p-3 pl-8 bg-[oklch(0.06_0.02_280)] border border-[oklch(0.25_0.05_280)] text-[10px] text-foreground focus:outline-none focus:border-neon-pink transition-colors font-mono placeholder:text-muted-foreground/30"
                  />
                  <MapPin className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground/60" />
                </div>
              </div>

              <div className="flex items-start gap-2 border border-neon-pink/20 bg-neon-pink/5 p-3 leading-relaxed text-neon-pink uppercase text-[8px] mt-1">
                <MapPin className="h-4 w-4 shrink-0 animate-bounce" />
                <span>SPECIFYING A VALID CITY ENABLES LOCAL FILTER CONTEXTS ON THE HALL OF MASTERS LEADERBOARDS.</span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-neon-pink hover:bg-neon-pink/90 text-background font-sans font-bold text-[9px] sm:text-[10px] tracking-widest pixel-border glow-purple cursor-pointer active:scale-95 transition-all uppercase disabled:opacity-50 mt-2"
                style={{
                  boxShadow: '0 0 0 2px var(--neon-pink), 0 0 20px oklch(0.7 0.22 330/0.4)'
                }}
              >
                APPLY PARAMETER ATTUNEMENT
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  )
}
