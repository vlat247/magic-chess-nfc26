'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Swords, Percent, Flame } from 'lucide-react'

interface StatsCardsProps {
  rating: number
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
}

// mini spark positions per card (relative %)
const CARD_SPARKS = [
  { left: '10%',  top: '80%', dur: '1.6s', delay: '0s'   },
  { left: '85%',  top: '75%', dur: '2.0s', delay: '0.5s' },
  { left: '50%',  top: '90%', dur: '1.8s', delay: '0.9s' },
  { left: '30%',  top: '85%', dur: '2.2s', delay: '0.3s' },
]

function SparkLayer({ color, active }: { color: string; active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {CARD_SPARKS.map((s, i) => (
        <div
          key={i}
          className="absolute animate-spark rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: 3,
            height: 3,
            background: color,
            boxShadow: `0 0 6px ${color}`,
            '--dur': s.dur,
            animationDelay: s.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

export function StatsCards({ rating, gamesPlayed, wins, losses, draws }: StatsCardsProps) {
  const winrate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const stats = [
    {
      title: 'Sorcerer ELO',
      value: rating,
      description: `Arcane ranking score`,
      icon: Trophy,
      neonClass: 'text-neon-gold',
      neonColor: 'oklch(0.8 0.18 85)',
      borderHover: 'hover:border-neon-gold',
      bgGradient: 'bg-zinc-950',
      pixelShadow: '4px 4px 0 oklch(0.8 0.18 85 / 0.5)',
      iconBg: 'bg-neon-gold/10 border-neon-gold/30',
      cornerColor: 'border-neon-gold/80',
      rune: '♜',
    },
    {
      title: 'Battles Fought',
      value: gamesPlayed,
      description: `${wins}W · ${losses}L · ${draws}D`,
      icon: Swords,
      neonClass: 'text-neon-purple',
      neonColor: 'oklch(0.7 0.25 300)',
      borderHover: 'hover:border-neon-purple',
      bgGradient: 'bg-zinc-950',
      pixelShadow: '4px 4px 0 oklch(0.7 0.25 300 / 0.5)',
      iconBg: 'bg-neon-purple/10 border-neon-purple/30',
      cornerColor: 'border-neon-purple/80',
      rune: '⚔',
    },
    {
      title: 'Win Rate',
      value: `${winrate}%`,
      description: 'Victorious spell ratio',
      icon: Percent,
      neonClass: 'text-neon-cyan',
      neonColor: 'oklch(0.7 0.2 195)',
      borderHover: 'hover:border-neon-cyan',
      bgGradient: 'bg-zinc-950',
      pixelShadow: '4px 4px 0 oklch(0.7 0.2 195 / 0.5)',
      iconBg: 'bg-neon-cyan/10 border-neon-cyan/30',
      cornerColor: 'border-neon-cyan/80',
      rune: '◈',
    },
    {
      title: 'Total Wins',
      value: wins,
      description: 'Games conquered',
      icon: Flame,
      neonClass: 'text-neon-pink',
      neonColor: 'oklch(0.7 0.22 330)',
      borderHover: 'hover:border-neon-pink',
      bgGradient: 'bg-zinc-950',
      pixelShadow: '4px 4px 0 oklch(0.7 0.22 330 / 0.5)',
      iconBg: 'bg-neon-pink/10 border-neon-pink/30',
      cornerColor: 'border-neon-pink/80',
      rune: '✦',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isHov = hoveredIdx === index
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.09 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative cursor-default animate-card-rise"
            style={{ animationDelay: `${index * 90}ms` }}
            onHoverStart={() => setHoveredIdx(index)}
            onHoverEnd={() => setHoveredIdx(null)}
          >
            {/* Rising sparks on hover */}
            <SparkLayer color={stat.neonColor} active={isHov} />

            {/* Card body */}
            <div
              className={`relative overflow-hidden border border-border/50 ${stat.borderHover} ${stat.bgGradient} transition-all duration-400`}
              style={{ boxShadow: isHov ? stat.pixelShadow : '2px 2px 0 rgba(0,0,0,0.8)' }}
            >
              {/* Animated top shimmer */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400 animate-shimmer"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.neonColor}, transparent)` }}
              />

              {/* Pixel corner brackets */}
              <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${stat.cornerColor} transition-all duration-300 group-hover:w-5 group-hover:h-5`} />
              <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${stat.cornerColor} transition-all duration-300 group-hover:w-5 group-hover:h-5`} />
              <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${stat.cornerColor} transition-all duration-300 group-hover:w-5 group-hover:h-5`} />
              <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${stat.cornerColor} transition-all duration-300 group-hover:w-5 group-hover:h-5`} />

              {/* Floating rune (top right bg) */}
              <div
                className="absolute top-3 right-12 font-bold text-[20px] opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500 select-none pointer-events-none"
                style={{ color: stat.neonColor }}
              >
                {stat.rune}
              </div>

              <div className="p-5 flex flex-col justify-between min-h-[128px]">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[8px] font-mono font-bold uppercase tracking-widest text-muted-foreground/70 group-hover:text-muted-foreground/90 transition-colors">
                      {stat.title}
                    </p>
                    <div
                      className={`text-2xl font-bold font-mono tracking-tight ${stat.neonClass} mt-1.5 transition-all duration-300`}
                    >
                      {stat.value}
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 20, scale: 1.15 }}
                    className={`p-2 border ${stat.iconBg} ${stat.neonClass} transition-all duration-300`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                </div>

                <div className="mt-3 border-t border-border/20 pt-2 flex items-center justify-between">
                  <p className="text-[8px] font-mono text-muted-foreground/65 uppercase tracking-wider">
                    {stat.description}
                  </p>
                  {/* Tiny spark icon on hover */}
                  <span
                    className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-twinkle"
                    style={{ color: stat.neonColor, '--dur': '1.8s' } as React.CSSProperties}
                  >
                    ✦
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
