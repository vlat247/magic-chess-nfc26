"use client"

import { useGameStore } from "../../store/game-store"
import { getGameMode } from "../../engine/modes/registry"
import { Flame, Snowflake, Shield as ShieldIcon, Sparkles, BookOpen, Clock, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SpellPanelProps {
  activeSpell: string | null
  onSelectSpell: (spellId: string | null) => void
}

export function SpellPanel({ activeSpell, onSelectSpell }: SpellPanelProps) {
  const gameModeId = useGameStore((state) => state.gameModeId)
  const turn = useGameStore((state) => state.turn)
  const chaosState = useGameStore((state) => state.chaosState)
  const aiLevel = useGameStore((state) => state.aiLevel)

  // Ensure this is only mounted in Spell Mode
  if (gameModeId !== "spell" || !chaosState) return null

  const activeMode = getGameMode("spell") as any
  const spells = activeMode.spells || []

  const mana = chaosState.mana || { w: 0, b: 0 }
  const cooldowns = chaosState.cooldowns || {
    w: { fireball: 0, freeze: 0, shield: 0 },
    b: { fireball: 0, freeze: 0, shield: 0 },
  }

  // Active caster stats
  const activeMana = turn === "w" ? mana.w : mana.b
  const activeCooldowns = turn === "w" ? cooldowns.w : cooldowns.b

  const isPlayerTurn = turn === "w" || aiLevel === "none"

  const spellDetails = [
    {
      id: "fireball",
      name: "Fireball",
      description: "Incinerates target piece (non-King). Breaks shields.",
      manaCost: 40,
      icon: Flame,
      color: "text-orange-500",
      bgGlow: "shadow-[0_0_15px_rgba(249,115,22,0.15)] border-orange-500/20",
      activeBg: "bg-orange-950/30 border-orange-500",
      gradient: "from-orange-600 to-red-500",
    },
    {
      id: "freeze",
      name: "Freeze",
      description: "Locks a piece in stasis for 2 turns. It cannot move or be captured.",
      manaCost: 30,
      icon: Snowflake,
      color: "text-cyan-400",
      bgGlow: "shadow-[0_0_15px_rgba(34,211,238,0.15)] border-cyan-400/20",
      activeBg: "bg-cyan-950/30 border-cyan-400",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      id: "shield",
      name: "Shield",
      description: "Shields a friendly piece. Absorbs captures and vaporizes the attacker.",
      manaCost: 30,
      icon: ShieldIcon,
      color: "text-amber-400",
      bgGlow: "shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-400/20",
      activeBg: "bg-amber-950/30 border-amber-400",
      gradient: "from-amber-500 to-yellow-400",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-5 p-5 border-2 border-neon-purple/40 bg-[oklch(0.085_0.02_280)] shadow-[0_0_30px_rgba(168,85,247,0.06)] relative overflow-hidden select-none"
    >
      {/* Decorative scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,1)_50%)] bg-[size:100%_4px]" />

      {/* Grimoire Title */}
      <div className="flex items-center gap-2 border-b border-[oklch(0.2_0.04_280)] pb-3">
        <BookOpen className="text-neon-purple animate-pulse h-4 w-4" />
        <h3 className="font-title text-base tracking-widest text-glow-gold text-neon-gold font-bold">
          ARCANE GRIMOIRE
        </h3>
      </div>

      {/* ── MANA POOLS ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3.5 bg-black/25 p-3.5 border border-[oklch(0.2_0.04_280)]">
        <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-neon-purple animate-spin-slow" />
          Magical Reserves (Mana)
        </span>

        {/* Light Magician Mana */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[9px] tracking-wider">
            <span className="text-neon-gold font-bold">LIGHT WIZARD</span>
            <span className="text-neon-gold font-bold">{mana.w} / 100 MP</span>
          </div>
          <div className="h-2.5 bg-black/60 border border-neon-gold/20 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mana.w}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            />
          </div>
        </div>

        {/* Dark Magician Mana */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[9px] tracking-wider">
            <span className="text-neon-cyan font-bold">DARK WIZARD</span>
            <span className="text-neon-cyan font-bold">{mana.b} / 100 MP</span>
          </div>
          <div className="h-2.5 bg-black/60 border border-neon-cyan/20 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mana.b}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* ── SPELL CARDS ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
          Select Spell to Cast
        </span>

        {spellDetails.map((spell) => {
          const cd = activeCooldowns?.[spell.id] || 0
          const hasMana = activeMana >= spell.manaCost
          const isSelected = activeSpell === spell.id
          const Icon = spell.icon

          const canCast = isPlayerTurn && cd === 0 && hasMana

          return (
            <motion.button
              key={spell.id}
              onClick={() => {
                if (!isPlayerTurn) return
                if (isSelected) {
                  onSelectSpell(null) // Cancel targeting
                } else if (canCast) {
                  onSelectSpell(spell.id) // Toggle targeting
                }
              }}
              whileHover={canCast ? { scale: 1.015, x: 2 } : {}}
              whileTap={canCast ? { scale: 0.985 } : {}}
              disabled={!isPlayerTurn}
              className={`flex flex-col p-3 border text-left transition-all duration-300 relative overflow-hidden group
                ${!isPlayerTurn ? "opacity-60 cursor-not-allowed" : ""}
                ${
                  isSelected
                    ? spell.activeBg
                    : canCast
                    ? `bg-[oklch(0.12_0.02_280)] border-[oklch(0.22_0.04_280)] cursor-pointer hover:border-neon-purple/50 ${spell.bgGlow}`
                    : "bg-black/40 border-dashed border-[oklch(0.18_0.04_280)] cursor-not-allowed"
                }
              `}
            >
              {/* Cooldown Mask */}
              {cd > 0 && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[0.5px] z-10 flex flex-col items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-neon-pink animate-pulse" />
                  <span className="font-mono text-[9px] tracking-widest text-neon-pink font-bold uppercase">
                    COOLDOWN: {cd} {cd === 1 ? "TURN" : "TURNS"}
                  </span>
                </div>
              )}

              {/* Insufficient Mana Mask */}
              {cd === 0 && !hasMana && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[0.2px] z-10 flex items-center justify-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground/80 font-bold uppercase">
                    INSUFFICIENT MANA
                  </span>
                </div>
              )}

              {/* Spell Header */}
              <div className="flex items-center gap-2 w-full">
                <div
                  className={`w-6 h-6 border flex items-center justify-center transition-all duration-300
                    ${
                      isSelected
                        ? "bg-purple-600/30 border-purple-500 scale-105"
                        : canCast
                        ? "bg-black/35 border-[oklch(0.22_0.04_280)] group-hover:scale-105"
                        : "bg-black/10 border-transparent"
                    }
                  `}
                >
                  <Icon className={`h-3.5 w-3.5 ${spell.color}`} />
                </div>
                <span className="font-mono text-xs font-bold tracking-widest text-foreground">
                  {spell.name}
                </span>

                <div className="ml-auto flex items-center gap-2 font-mono text-[9px] tracking-wider">
                  <span className="text-neon-cyan bg-neon-cyan/5 px-1.5 py-0.5 border border-neon-cyan/20">
                    {spell.manaCost} MP
                  </span>
                </div>
              </div>

              {/* Spell Description */}
              <p className="mt-2 font-mono text-[8px] leading-relaxed text-muted-foreground tracking-wide group-hover:text-foreground/90 transition-colors">
                {spell.description}
              </p>

              {/* Targeting indicator */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-1 right-2 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono text-[7px] tracking-widest text-red-400 font-bold uppercase">
                    Targeting Square...
                  </span>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ── GRIMOIRE CONTROL STATUS ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeSpell ? (
          <motion.div
            key="targeting-help"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-2.5 p-3.5 border border-red-500/30 bg-red-950/15"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 animate-ping rounded-full" />
              <span className="font-mono text-[9px] text-red-400 tracking-widest font-bold uppercase">
                TARGETING ACTIVE
              </span>
            </div>
            <p className="font-mono text-[8px] text-red-200/80 leading-relaxed tracking-wide">
              Click any valid square on the chessboard to launch your spell. Casting completes your turn.
            </p>
            <button
              onClick={() => onSelectSpell(null)}
              className="py-1.5 px-3 border border-red-500/50 hover:bg-red-500/10 text-red-400 font-mono text-[9px] tracking-widest uppercase transition-colors"
            >
              Cancel Spell Cast
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="standard-turn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-black/20 border border-[oklch(0.2_0.04_280)] font-mono text-[8px] text-muted-foreground leading-relaxed text-center tracking-wide"
          >
            {!isPlayerTurn ? (
              <span className="text-neon-cyan/70 font-bold uppercase animate-pulse">
                Awaiting opponent's magical action...
              </span>
            ) : (
              <span>
                Spellcasting takes the place of your chess move. Spells are instant and ignore obstacles.
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
