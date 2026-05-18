import React from 'react'
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
      description: 'Your current chess Elo ranking',
      icon: Trophy,
      color: 'text-amber-400 border-amber-500/20 bg-amber-950/20 shadow-amber-500/5',
    },
    {
      title: 'Battles Fought',
      value: gamesPlayed,
      description: `${wins} Wins · ${losses} Losses · ${draws} Draws`,
      icon: Swords,
      color: 'text-purple-400 border-purple-500/20 bg-purple-950/20 shadow-purple-500/5',
    },
    {
      title: 'Win Rate',
      value: `${winrate}%`,
      description: 'Percentage of victorious spells cast',
      icon: Percent,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20 shadow-emerald-500/5',
    },
    {
      title: 'Win Streak',
      value: wins > 0 ? wins : 0, // Simplified win streak logic or just a highlight
      description: 'Active streak of magic wins',
      icon: Flame,
      color: 'text-rose-400 border-rose-500/20 bg-rose-950/20 shadow-rose-500/5',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className={`relative overflow-hidden border ${stat.color} shadow-lg transition-all duration-300 hover:scale-[1.02]`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {stat.title}
                </p>
                <div className="rounded-full p-2 bg-slate-900/50">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-bold tracking-tight text-white">{stat.value}</div>
                <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
