'use client'

import React from 'react'
import { motion } from 'framer-motion'
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
      title: 'Sorcerer ELO',
      value: rating,
      description: `Arcane ranking score`,
      icon: Trophy,
      valueClass: 'text-zinc-100',
      iconClass: 'text-amber-500/80',
      iconBg: 'bg-amber-500/5 border-amber-500/20 group-hover:border-amber-500/40',
    },
    {
      title: 'Battles Fought',
      value: gamesPlayed,
      description: `${wins}W · ${losses}L · ${draws}D`,
      icon: Swords,
      valueClass: 'text-zinc-100',
      iconClass: 'text-zinc-400 group-hover:text-zinc-200',
      iconBg: 'bg-zinc-900/50 border-white/[0.06] group-hover:border-white/25',
    },
    {
      title: 'Win Rate',
      value: `${winrate}%`,
      description: 'Victorious spell ratio',
      icon: Percent,
      valueClass: 'text-zinc-100',
      iconClass: 'text-zinc-400 group-hover:text-zinc-200',
      iconBg: 'bg-zinc-900/50 border-white/[0.06] group-hover:border-white/25',
    },
    {
      title: 'Total Wins',
      value: wins,
      description: 'Games conquered',
      icon: Flame,
      valueClass: 'text-zinc-100',
      iconClass: 'text-amber-500/80',
      iconBg: 'bg-amber-500/5 border-amber-500/20 group-hover:border-amber-500/40',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.09 }}
            whileHover={{ y: -3 }}
            className="group relative cursor-default"
          >
            {/* Card body */}
            <div className="relative overflow-hidden rounded-xl border border-white/[0.06] hover:border-white/20 bg-zinc-950/40 backdrop-blur-xl transition-all duration-300 p-5 flex flex-col justify-between min-h-[128px] shadow-md">
              {/* Subtle corner markers */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-hover:border-white/20 transition-colors" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/10 group-hover:border-white/20 transition-colors" />

              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
                    {stat.title}
                  </p>
                  <div className={`text-2xl font-bold font-mono tracking-tight ${stat.valueClass} mt-1.5`}>
                    {stat.value}
                  </div>
                </div>
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className={`p-2 border rounded-lg ${stat.iconBg} ${stat.iconClass} transition-all duration-300`}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
              </div>

              <div className="mt-3 border-t border-white/[0.06] pt-2 flex items-center justify-between">
                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                  {stat.description}
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

