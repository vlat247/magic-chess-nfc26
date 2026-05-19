'use client'

import React, { useState, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Search, MapPin, Flame, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FantasyPixelCard } from '@/components/ui/fantasy-pixel-card'

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
      .filter(u => !u.is_guest || (u.username && !u.username.startsWith('Guest_')) || u.games_played > 0)
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
    <div className="flex flex-col gap-8 w-full relative z-10 animate-in fade-in duration-300">
      
      {/* ── SEARCH & FILTER CONTROLS (Lobby tab and config style) ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        
        {/* Toggle tabs (Muted gunmetal/steel style matching profile-tabs) */}
        <div className="flex border-b-2 border-[#2D3748] bg-[#2D3748]/30 backdrop-blur-md font-mono text-[9px] tracking-widest relative rounded-none self-start shrink-0">
          <button
            onClick={() => { setActiveTab('global'); setSearchQuery('') }}
            className={cn(
              "px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-300 uppercase flex items-center gap-2 shrink-0 relative rounded-none",
              activeTab === 'global'
                ? "border-[#BFC7D5] text-[#BFC7D5] bg-[#BFC7D5]/5 font-bold"
                : "border-transparent text-[#8D99AE] hover:text-[#BFC7D5] hover:bg-[#2D3748]/20"
            )}
          >
            <Trophy className="h-3.5 w-3.5" />
            GLOBAL MASTERS
          </button>
          
          <button
            onClick={() => { setActiveTab('city'); setSearchQuery('') }}
            className={cn(
              "px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-300 uppercase flex items-center gap-2 shrink-0 relative rounded-none",
              activeTab === 'city'
                ? "border-[#BFC7D5] text-[#BFC7D5] bg-[#BFC7D5]/5 font-bold"
                : "border-transparent text-[#8D99AE] hover:text-[#BFC7D5] hover:bg-[#2D3748]/20"
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            CITY GUILDS
          </button>
        </div>

        {/* Search and City Selectors (Lobby input style) */}
        <div className="flex items-center gap-3 flex-1 max-w-md w-full self-stretch md:self-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="SEARCH SUMMONERS..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-3.5 pl-9 bg-[#1E2530] border-2 border-[#4A5568] font-mono text-[9px] sm:text-[10px] text-white placeholder:text-[#4A5568] focus:border-[#8D99AE] focus:outline-none transition-all rounded-none hover:border-[#8D99AE] tracking-widest"
            />
            <Search className="absolute left-3 top-4.5 h-3.5 w-3.5 text-[#4A5568]" />
          </div>

          {activeTab === 'city' && (
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="p-3.5 bg-[#1E2530] border-2 border-[#4A5568] font-mono text-[9px] sm:text-[10px] text-white focus:border-[#8D99AE] hover:border-[#8D99AE] focus:outline-none transition-all rounded-none cursor-pointer tracking-widest"
            >
              {uniqueCities.map(city => (
                <option key={city} value={city} className="bg-[#1E2530] text-white">
                  {city.toUpperCase()}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── PODIUM SECTION (Mettalic & Retro 3D columns) ─────────────────────────────────────────────── */}
      {podiumOrder.length > 0 && searchQuery === '' && (
        <FantasyPixelCard theme="default" title="PODIUM MASTERS">
          <div className="flex flex-col items-center justify-end min-h-[340px] pt-12 relative overflow-hidden select-none">
            <div className="flex items-end justify-center gap-4 sm:gap-12 relative z-10 w-full max-w-3xl h-full mt-auto">
              {podiumOrder.map(({ user, rank }) => {
                const username = user.username ?? 'Mage'
                const rating = user.rating
                const level = user.level ?? 1
                const streak = user.win_streak ?? 0
                const city = user.city
                const isCurrentUser = currentUser?.id === user.id

                // Retro theme configurations based on placement (Gold, Silver, Bronze/Gunmetal)
                const theme = 
                  rank === 1 ? { border: 'border-2 border-[#FACC15] bg-[#FACC15]/5 shadow-[2px_2px_0px_#000000]', text: 'text-[#FACC15] text-glow-gold font-bold', name: '1st', barColor: 'bg-[#FACC15]/10 border-t-2 border-t-[#FACC15]', height: 'h-40 sm:h-48' } :
                  rank === 2 ? { border: 'border-2 border-[#BFC7D5] bg-[#BFC7D5]/5 shadow-[2px_2px_0px_#000000]', text: 'text-[#BFC7D5] font-bold', name: '2nd', barColor: 'bg-[#BFC7D5]/10 border-t-2 border-t-[#BFC7D5]', height: 'h-32 sm:h-38' } :
                  { border: 'border-2 border-[#8D99AE] bg-[#8D99AE]/5 shadow-[2px_2px_0px_#000000]', text: 'text-[#8D99AE] font-bold', name: '3rd', barColor: 'bg-[#8D99AE]/10 border-t-2 border-t-[#8D99AE]', height: 'h-24 sm:h-28' }

                return (
                  <div key={user.id} className="flex flex-col items-center justify-end flex-1 max-w-[180px] h-full text-center">
                    
                    {/* User Profile Info above Podium Bar */}
                    <div className="flex flex-col items-center gap-1.5 mb-3.5 w-full relative">
                      
                      {/* Square Avatar with pixel border */}
                      <div className={cn("rounded-none p-0.5 shrink-0 relative transition-transform duration-300 hover:scale-105", theme.border)}>
                        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 rounded-none">
                          <AvatarImage src={user.avatar_url || ''} className="object-cover rounded-none" />
                          <AvatarFallback className="font-mono text-xs rounded-none" style={{ background: 'oklch(0.18 0.06 300)', color: 'oklch(0.8 0.2 300)' }}>
                            {getInitials(username)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Level Square Badge */}
                        <span className="absolute -bottom-1 -right-1 bg-[#1E2530] border border-[#4A5568] text-[7px] text-white font-mono w-5 h-5 flex items-center justify-center rounded-none font-bold leading-none shadow-[2px_2px_0px_#000000]">
                          {level}
                        </span>
                      </div>

                      {/* Username & Pro check */}
                      <div className="flex items-center gap-1 mt-1">
                        <span className={cn("font-mono text-[9px] sm:text-[10px] tracking-widest truncate max-w-[80px] sm:max-w-[120px] font-bold block uppercase", isCurrentUser ? 'text-[#FACC15]' : 'text-zinc-100')}>
                          {username}
                        </span>
                        {user.is_pro && (
                          <ShieldCheck className="h-3.5 w-3.5 text-[#FACC15] shrink-0" />
                        )}
                      </div>

                      {/* Location */}
                      {city && (
                        <span className="font-mono text-[7px] text-[#8D99AE]/80 flex items-center gap-0.5 uppercase tracking-wider">
                          <MapPin className="h-2 w-2 text-[#8D99AE] shrink-0" />
                          {city}
                        </span>
                      )}

                      {/* ELO Display */}
                      <span className="font-mono text-xs sm:text-xs font-bold text-zinc-100 block mt-0.5 uppercase tracking-widest">
                        ⚔️ {rating} ELO
                      </span>

                      {/* Streak flame */}
                      {streak >= 2 && (
                        <span className="font-mono text-[7px] text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-1.5 py-0.5 flex items-center gap-0.5 mt-0.5 rounded-none shadow-[2px_2px_0px_#000000]">
                          <Flame className="h-2.5 w-2.5 animate-pulse text-[#FACC15]" />
                          STREAK {streak}
                        </span>
                      )}
                    </div>

                    {/* Visual Podium Base Column */}
                    <div className={cn("w-full relative flex items-center justify-center border-x-2 border-[#4A5568] bg-[#1E2530]/40 rounded-none shadow-[4px_4px_0px_#000000]", theme.height, theme.barColor)}>
                      <div className="absolute inset-0 pointer-events-none bg-black/10" />
                      
                      {/* Corner markings for podium bases */}
                      <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#4A5568]/40" />
                      <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#4A5568]/40" />

                      {/* Rank Number Inside Base */}
                      <div className="flex flex-col items-center justify-center">
                        <span className={cn("font-mono text-3xl sm:text-4xl font-bold opacity-80", theme.text)}>
                          #{rank}
                        </span>
                        <span className="font-mono text-[7px] tracking-widest text-zinc-500 uppercase font-bold">
                          RANK
                        </span>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        </FantasyPixelCard>
      )}

      {/* ── LIST LEADERBOARD TABLE (High-contrast Lobby styling) ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <FantasyPixelCard theme="default" title="RANKING REGISTRY" noPadding>
          <div className="overflow-x-auto w-full font-mono text-[9px] sm:text-[10px] tracking-widest">
            {/* Header */}
            <div className="grid grid-cols-12 p-4 bg-[#2D3748]/60 border-b-2 border-[#4A5568] text-[#8D99AE] uppercase text-[8px] tracking-widest font-bold min-w-[600px]">
              <div className="col-span-1 text-center">RANK</div>
              <div className="col-span-4 pl-2">SUMMONER</div>
              <div className="col-span-2 text-center">RATING</div>
              <div className="col-span-2 text-center">RECORD</div>
              <div className="col-span-1 text-center">STREAK</div>
              <div className="col-span-2 text-center">GUILD</div>
            </div>

            {/* List display */}
            <div className="divide-y divide-[#4A5568]/40 min-w-[600px]">
              {filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-[#8D99AE] uppercase font-mono text-[10px] tracking-widest">
                  No Summoners Have Conquered These Realms Yet.
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
                  
                  // Color modifiers matching the lobby's steel, silver, and gold accents
                  const rankColor = 
                    rank === 1 ? 'text-[#FACC15] font-bold text-glow-gold' :
                    rank === 2 ? 'text-[#BFC7D5] font-bold' :
                    rank === 3 ? 'text-[#8D99AE] font-bold' :
                    isCurrentUser ? 'text-[#FACC15] font-bold' : 'text-zinc-300';

                  return (
                    <div 
                      key={user.id} 
                      className={cn(
                        "grid grid-cols-12 p-3.5 items-center hover:bg-[#2D3748]/20 transition-all duration-200", 
                        isCurrentUser && 'bg-[#FACC15]/5 border-l-4 border-l-[#FACC15]'
                      )}
                    >
                      {/* Rank */}
                      <div className={cn("col-span-1 text-center font-bold text-[10px]", rankColor)}>
                        #{rank}
                      </div>

                      {/* Summoner Name + Level */}
                      <div className="col-span-4 pl-2 flex items-center gap-2.5">
                        <div className="p-0.5 bg-[#1E2530] border border-[#4A5568] shrink-0 rounded-none shadow-[1px_1px_0px_#000000]">
                          <Avatar className="h-6 w-6 rounded-none">
                            <AvatarImage src={user.avatar_url || ''} className="rounded-none object-cover" />
                            <AvatarFallback className="text-[8px] rounded-none">{getInitials(username)}</AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex flex-col leading-none">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("font-bold uppercase text-[10px] tracking-wide", rankColor)}>{username}</span>
                            {user.is_pro && (
                              <ShieldCheck className="h-3.5 w-3.5 text-[#FACC15] shrink-0" />
                            )}
                          </div>
                          <span className="text-[7px] text-[#8D99AE] uppercase mt-0.5 font-semibold">LEVEL {level}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="col-span-2 text-center font-bold text-zinc-100 tabular-nums">
                        ⚔️ {rating}
                      </div>

                      {/* Record */}
                      <div className="col-span-2 text-center text-[#8D99AE] tabular-nums text-[9px]">
                        {wins}W / {losses}L
                      </div>

                      {/* Streak */}
                      <div className="col-span-1 text-center">
                        {streak >= 2 ? (
                          <span className="inline-flex items-center gap-0.5 text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-1.5 py-0.5 rounded-none text-[8px] font-bold shadow-[1.5px_1.5px_0px_#000000]">
                            <Flame className="h-2.5 w-2.5 animate-pulse text-[#FACC15]" />
                            {streak} 🔥
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[8px]">—</span>
                        )}
                      </div>

                      {/* City */}
                      <div className="col-span-2 text-center text-[8px] sm:text-[9px] uppercase truncate text-[#8D99AE]">
                        {city ? (
                          <span className="flex items-center justify-center gap-1 text-[8px]">
                            <MapPin className="h-2 w-2 text-[#8D99AE] shrink-0" />
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
        </FantasyPixelCard>
      </div>

    </div>
  )
}
