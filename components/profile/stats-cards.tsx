'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Swords, Percent, Flame } from 'lucide-react'

interface StatsCardsProps {
  rating: number
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
}

export function StatsCards({ rating, gamesPlayed, wins, losses, draws }: StatsCardsProps) {
  const winrate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0

  const stats = [
    {
      title: 'Sorcerer Rating',
      value: rating,
      description: 'Your current chess ELO ranking',
      icon: Trophy,
      color: 'text-neon-gold',
      borderGlow: 'hover:shadow-[0_0_20px_oklch(0.8_0.18_85/0.25)] hover:border-neon-gold/50',
      bgGradient: 'from-amber-950/15 via-zinc-950/40 to-amber-950/5',
      iconBg: 'bg-neon-gold/10 border-neon-gold/20 text-neon-gold',
    },
    {
      title: 'Battles Fought',
      value: gamesPlayed,
      description: `${wins} W · ${losses} L · ${draws} D`,
      icon: Swords,
      color: 'text-neon-purple',
      borderGlow: 'hover:shadow-[0_0_20px_oklch(0.7_0.25_300/0.25)] hover:border-neon-purple/50',
      bgGradient: 'from-purple-950/15 via-zinc-950/40 to-purple-950/5',
      iconBg: 'bg-neon-purple/10 border-neon-purple/20 text-neon-purple',
    },
    {
      title: 'Win Rate',
      value: `${winrate}%`,
      description: 'Percentage of victorious spells',
      icon: Percent,
      color: 'text-neon-cyan',
      borderGlow: 'hover:shadow-[0_0_20px_oklch(0.7_0.2_195/0.25)] hover:border-neon-cyan/50',
      bgGradient: 'from-cyan-950/15 via-zinc-950/40 to-cyan-950/5',
      iconBg: 'bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan',
    },
    {
      title: 'Win Streak',
      value: wins > 0 ? wins : 0,
      description: 'Active streak of magic wins',
      icon: Flame,
      color: 'text-neon-pink',
      borderGlow: 'hover:shadow-[0_0_20px_oklch(0.7_0.22_330/0.25)] hover:border-neon-pink/50',
      bgGradient: 'from-fuchsia-950/15 via-zinc-950/40 to-fuchsia-950/5',
      iconBg: 'bg-neon-pink/10 border-neon-pink/20 text-neon-pink',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative"
          >
            {/* Ambient Background Glow on Hover */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl from-purple-500/10 via-cyan-500/10 to-yellow-500/10" />

            <Card
              className={`relative overflow-hidden border border-border/60 bg-gradient-to-br ${stat.bgGradient} backdrop-blur-md transition-all duration-300 ${stat.borderGlow}`}
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/20 group-hover:border-foreground/40 transition-colors duration-300" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-muted-foreground/20 group-hover:border-foreground/40 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-muted-foreground/20 group-hover:border-foreground/40 transition-colors duration-300" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/20 group-hover:border-foreground/40 transition-colors duration-300" />

              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      {stat.title}
                    </p>
                    <div className={`text-2xl font-bold font-mono tracking-tight ${stat.color} mt-1.5`}>
                      {stat.value}
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className={`rounded-sm p-2 border ${stat.iconBg} transition-all duration-300 shadow-sm`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                </div>
                <div className="mt-3 border-t border-border/20 pt-2 flex items-center justify-between">
                  <p className="text-[8px] font-mono text-muted-foreground/80 uppercase tracking-wider">
                    {stat.description}
                  </p>
                  <span className="text-[7px] font-mono text-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-foreground/40 tracking-widest">
                    SECURE SEC
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
