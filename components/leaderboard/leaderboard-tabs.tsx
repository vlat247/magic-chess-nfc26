'use client'

import React, { useState, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Search, MapPin, Flame, Star, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardUser {
  id: string
  username: string | null
  avatar_url: string | null
  rating: number
  wins: number
  losses: number
  games_played: number
  win_streak: number
  max_win_streak: number
  xp: number
  level: number
  city: string | null
  is_guest: boolean
  is_pro?: boolean
}

interface LeaderboardTabsProps {
  initialUsers: LeaderboardUser[]
  currentUser?: { id: string } | null
}

export function LeaderboardTabs({ initialUsers, currentUser }: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'city'>('global')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('All Cities')

  // Find unique cities for city dropdown
  const uniqueCities = useMemo(() => {
    const list = new Set<string>()
    initialUsers.forEach(u => {
      if (u.city) list.add(u.city.trim())
    })
    return ['All Cities', ...Array.from(list)]
  }, [initialUsers])

  // Filter users based on search query, selected tab, and city filter
  const filteredUsers = useMemo(() => {
    return initialUsers
      .filter(u => !u.is_guest) // Filter out guest accounts
      .filter(u => {
        // Search query filter
        const matchSearch = (u.username ?? 'Mage').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.city ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchSearch) return false

        // Tab and city filters
        if (activeTab === 'city') {
          if (!u.city) return false // Must have city
          if (selectedCity !== 'All Cities' && u.city.trim().toLowerCase() !== selectedCity.toLowerCase()) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => b.rating - a.rating || b.wins - a.wins) // Sort by ELO, then wins
  }, [initialUsers, activeTab, searchQuery, selectedCity])

  // Extract Podium (Top 3)
  const podiumUsers = useMemo(() => {
    return filteredUsers.slice(0, 3)
  }, [filteredUsers])

  // Remaining users
  const listUsers = useMemo(() => {
    return filteredUsers.slice(3)
  }, [filteredUsers])

  // Helper to get initials
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  // Get podium order (2nd, 1st, 3rd for aesthetic visual layout)
  const podiumOrder = useMemo(() => {
    const order = []
    if (podiumUsers[1]) order.push({ user: podiumUsers[1], rank: 2 }) // 2nd on left
    if (podiumUsers[0]) order.push({ user: podiumUsers[0], rank: 1 }) // 1st in center
    if (podiumUsers[2]) order.push({ user: podiumUsers[2], rank: 3 }) // 3rd on right
    return order
  }, [podiumUsers])

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* ── SEARCH & FILTER CONTROLS ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Toggle tabs */}
        <div className="flex bg-[oklch(0.08_0.02_280)] p-1 border border-[oklch(0.2_0.04_280)] rounded-md self-start">
          <button
            onClick={() => { setActiveTab('global'); setSearchQuery('') }}
            className={cn(
              "px-4 py-2 font-mono text-[10px] tracking-widest cursor-pointer transition-all duration-200 uppercase",
              activeTab === 'global'
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                : "text-muted-foreground hover:bg-white/5"
            )}
          >
            GLOBAL MASTERS
          </button>
          
          <button
            onClick={() => { setActiveTab('city'); setSearchQuery('') }}
            className={cn(
              "px-4 py-2 font-mono text-[10px] tracking-widest cursor-pointer transition-all duration-200 uppercase",
              activeTab === 'city'
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                : "text-muted-foreground hover:bg-white/5"
            )}
          >
            CITY GUILDS
          </button>
        </div>

        {/* Search and City Selectors */}
        <div className="flex items-center gap-3 flex-1 max-w-md w-full self-stretch">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Summoners..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-2.5 pl-9 bg-[oklch(0.08_0.02_280)] border border-[oklch(0.2_0.04_280)] font-mono text-[10px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-purple transition-colors"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
          </div>

          {activeTab === 'city' && (
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="p-2.5 bg-[oklch(0.08_0.02_280)] border border-[oklch(0.2_0.04_280)] font-mono text-[10px] text-foreground focus:outline-none focus:border-neon-purple cursor-pointer"
            >
              {uniqueCities.map(city => (
                <option key={city} value={city} className="bg-[oklch(0.08_0.02_280)] text-foreground">
                  {city}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── 3D PODIUM SECTION ─────────────────────────────────────────────── */}
      {podiumOrder.length > 0 && searchQuery === '' && (
        <section className="flex flex-col items-center justify-end min-h-[380px] pt-10 border border-[oklch(0.22_0.06_300)] bg-[oklch(0.09_0.025_280)] relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(10,5,25,0.7)_100%)] z-0 pointer-events-none" />
          
          <div className="flex items-end justify-center gap-4 sm:gap-12 relative z-10 w-full max-w-3xl h-full mt-auto">
            {podiumOrder.map(({ user, rank }) => {
              const username = user.username ?? 'Mage'
              const rating = user.rating
              const level = user.level ?? 1
              const streak = user.win_streak ?? 0
              const city = user.city
              const isCurrentUser = currentUser?.id === user.id

              // Theme variables based on ranking
              const theme = 
                rank === 1 ? { border: 'border-2 border-neon-gold glow-gold', text: 'text-neon-gold', name: '1st', barColor: 'bg-gradient-to-t from-yellow-600/30 to-yellow-400/10 border-t-2 border-t-neon-gold', height: 'h-40 sm:h-48' } :
                rank === 2 ? { border: 'border-2 border-neon-cyan glow-cyan', text: 'text-neon-cyan', name: '2nd', barColor: 'bg-gradient-to-t from-cyan-600/20 to-cyan-400/5 border-t-2 border-t-neon-cyan', height: 'h-32 sm:h-38' } :
                { border: 'border-2 border-neon-purple glow-purple', text: 'text-neon-purple', name: '3rd', barColor: 'bg-gradient-to-t from-purple-600/20 to-purple-400/5 border-t-2 border-t-neon-purple', height: 'h-24 sm:h-28' }

              return (
                <div key={user.id} className="flex flex-col items-center justify-end flex-1 max-w-[180px] h-full text-center">
                  
                  {/* User Profile Info above Podium Bar */}
                  <div className="flex flex-col items-center gap-1.5 mb-3 w-full relative">
                    
                    {/* Avatar with Glow Border */}
                    <div className={cn("rounded-full p-0.5 shrink-0 relative transition-transform duration-300 hover:scale-105", theme.border)}>
                      <Avatar className="h-14 w-14 sm:h-18 sm:w-18">
                        <AvatarImage src={user.avatar_url || ''} className="object-cover" />
                        <AvatarFallback className="font-mono text-xs" style={{ background: 'oklch(0.18 0.06 300)', color: 'oklch(0.8 0.2 300)' }}>
                          {getInitials(username)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Level Ring Badge */}
                      <span className="absolute -bottom-1 -right-1 bg-black border border-muted-foreground/60 text-[7px] text-foreground font-mono w-5 h-5 flex items-center justify-center rounded-full leading-none">
                        {level}
                      </span>
                    </div>

                    {/* Username & Pro check */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn("font-mono text-[9px] sm:text-[10px] tracking-wide truncate max-w-[80px] sm:max-w-[120px] font-bold block", isCurrentUser ? 'text-neon-pink' : 'text-foreground')}>
                        {username}
                      </span>
                      {user.is_pro && (
                        <ShieldCheck className="h-3 w-3 text-neon-gold shrink-0" />
                      )}
                    </div>

                    {/* Location */}
                    {city && (
                      <span className="font-mono text-[7px] text-muted-foreground/80 flex items-center gap-0.5 uppercase">
                        <MapPin className="h-2 w-2 text-neon-cyan shrink-0" />
                        {city}
                      </span>
                    )}

                    {/* ELO Display */}
                    <span className="font-mono text-xs sm:text-sm font-bold text-foreground block tabular-nums mt-0.5">
                      ⚔️ {rating}
                    </span>

                    {/* Streak flame */}
                    {streak >= 2 && (
                      <span className="font-mono text-[7px] text-red-400 bg-red-950/40 border border-red-500/20 px-1.5 py-0.5 flex items-center gap-0.5 mt-0.5">
                        <Flame className="h-2.5 w-2.5 animate-pulse text-red-400" />
                        STREAK {streak}
                      </span>
                    )}
                  </div>

                  {/* Visual Podium Base Column */}
                  <div className={cn("w-full relative flex items-center justify-center", theme.height, theme.barColor)}>
                    <div className="absolute inset-0 pointer-events-none bg-black/10" />
                    
                    {/* Rank Number Inside Base */}
                    <div className="flex flex-col items-center justify-center">
                      <span className={cn("font-title text-4xl sm:text-5xl font-bold opacity-80 text-glow-gold", theme.text)}>
                        {rank}
                      </span>
                      <span className="font-mono text-[7px] tracking-widest text-muted-foreground uppercase opacity-60">
                        RANK
                      </span>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── LIST LEADERBOARD TABLE ───────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-4 w-4 text-neon-cyan" style={{ filter: 'drop-shadow(0 0 6px oklch(0.7 0.2 195))' }} />
          <h2 className="font-mono text-xs tracking-widest text-neon-cyan uppercase">Summoner rankings</h2>
          <div className="flex-1 h-px bg-neon-cyan opacity-20" />
        </div>

        <div className="border border-[oklch(0.22_0.06_300)] bg-[oklch(0.09_0.025_280)] overflow-hidden font-mono text-[9px] sm:text-[10px] tracking-wider relative">
          
          {/* Header */}
          <div className="grid grid-cols-12 p-3 bg-[oklch(0.07_0.02_280)] border-b border-[oklch(0.2_0.04_280)] text-muted-foreground uppercase text-[8px] tracking-widest">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-4 sm:col-span-5 pl-2">SUMMONER</div>
            <div className="col-span-3 sm:col-span-2 text-center">RATING</div>
            <div className="col-span-2 text-center hidden sm:block">RECORD</div>
            <div className="col-span-2 text-center">STREAK</div>
            <div className="col-span-2 sm:col-span-2 text-center">CITY</div>
          </div>

          {/* List display */}
          <div className="divide-y divide-[oklch(0.18_0.03_280)]">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground uppercase font-mono text-[10px] tracking-widest">
                No Summoners Have Conquered These Filters Yet.
              </div>
            ) : (
              filteredUsers.map((user, idx) => {
                const rank = idx + 1
                const username = user.username ?? 'Mage'
                const rating = user.rating
                const wins = user.wins ?? 0
                const losses = user.losses ?? 0
                const level = user.level ?? 1
                const streak = user.win_streak ?? 0
                const city = user.city
                const isCurrentUser = currentUser?.id === user.id
                
                // Color modifiers for top 3 in the regular table view
                const rankColor = 
                  rank === 1 ? 'text-neon-gold font-bold text-glow-gold' :
                  rank === 2 ? 'text-neon-cyan font-bold' :
                  rank === 3 ? 'text-neon-purple font-bold' :
                  isCurrentUser ? 'text-neon-pink font-bold' : 'text-foreground';

                return (
                  <div key={user.id} className={cn("grid grid-cols-12 p-3.5 items-center hover:bg-white/[0.02] transition-colors", isCurrentUser && 'bg-white/[0.015] border-l-2 border-l-neon-pink')}>
                    {/* Rank */}
                    <div className={cn("col-span-1 text-center font-bold", rankColor)}>
                      #{rank}
                    </div>

                    {/* Summoner Name + Level */}
                    <div className="col-span-4 sm:col-span-5 pl-2 flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-muted-foreground/30">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="text-[8px]">{getInitials(username)}</AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col leading-none">
                        <div className="flex items-center gap-1">
                          <span className={cn("font-bold", rankColor)}>{username}</span>
                          {user.is_pro && (
                            <ShieldCheck className="h-3 w-3 text-neon-gold shrink-0" />
                          )}
                        </div>
                        <span className="text-[7px] text-muted-foreground uppercase mt-0.5">LEVEL {level}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="col-span-3 sm:col-span-2 text-center font-bold text-foreground tabular-nums">
                      ⚔️ {rating}
                    </div>

                    {/* Record */}
                    <div className="col-span-2 text-center text-muted-foreground hidden sm:block tabular-nums text-[9px]">
                      {wins}W / {losses}L
                    </div>

                    {/* Streak */}
                    <div className="col-span-2 text-center">
                      {streak >= 2 ? (
                        <span className="inline-flex items-center gap-0.5 text-red-400 bg-red-950/20 border border-red-500/20 px-1 py-0.5 rounded-sm text-[8px]">
                          <Flame className="h-2.5 w-2.5 animate-pulse text-red-400" />
                          {streak} 🔥
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 text-[8px]">—</span>
                      )}
                    </div>

                    {/* City */}
                    <div className="col-span-2 text-center text-[8px] sm:text-[9px] uppercase truncate text-muted-foreground">
                      {city ? (
                        <span className="flex items-center justify-center gap-0.5">
                          <MapPin className="h-2 w-2 text-neon-cyan shrink-0" />
                          {city}
                        </span>
                      ) : (
                        <span className="opacity-40">—</span>
                      )}
                    </div>

                  </div>
                )
              })
            )}
          </div>
          
        </div>
      </section>

    </div>
  )
}
