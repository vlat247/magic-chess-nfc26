import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/profile/stats-cards'
import { RecentMatches } from '@/components/profile/recent-matches'
import { Header } from '@/components/arcane-chess/header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { logout } from '@/actions/auth'
import { FantasyPixelCard } from '@/components/ui/fantasy-pixel-card'
import {
  ShieldCheck,
  LogOut,
  Trophy,
  MapPin,
  Zap,
  Calendar,
  TrendingUp,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const rating = profile?.rating ?? 1200
  const gamesPlayed = profile?.games_played ?? 0
  const wins = profile?.wins ?? 0
  const losses = profile?.losses ?? 0
  const draws = profile?.draws ?? 0
  const city = profile?.city
  const level = profile?.level ?? 1
  const isPro = subscription?.status === 'active' || subscription?.plan === 'pro'
  const username = profile?.username ?? 'Mage'
  const xp = profile?.xp ?? 0
  const xpInLevel = xp % 1000
  const xpPct = Math.round(xpInLevel / 10)
  const winrate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <main className="relative min-h-screen bg-[#0C0F16] overflow-x-hidden pt-20 pb-16">
      <Header />

      {/* Grid effects (Muted steel grid matching rankings) */}
      <div
        className="absolute inset-0 opacity-8 animate-grid pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(141, 153, 174, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(141, 153, 174, 0.08) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(6,8,12,0.99)_100%)] z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* ── LEFT SIDEBAR: Player Card ─────────────────────────────────── */}
          <aside className="flex flex-col gap-4">

            {/* Identity Card */}
            <FantasyPixelCard theme="purple">
              <div className="flex flex-col gap-4">
                {/* Name + Level */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-base font-bold text-white truncate">{username}</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                      {city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-zinc-500" />
                          {city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0 text-zinc-500" />
                        {joinDate}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-center justify-center border-2 border-neon-purple/40 bg-zinc-950/80 rounded-none w-12 h-12 shadow-[2px_2px_0px_#000000]">
                    <span className="text-sm font-mono font-bold text-neon-purple leading-none">{level}</span>
                    <span className="text-[7px] font-mono text-neon-purple/70 uppercase tracking-widest mt-0.5 leading-none">Lvl</span>
                  </div>
                </div>

                {/* XP Bar */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 font-mono text-[9px] uppercase tracking-wider">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-neon-purple animate-pulse" />
                      Experience
                    </span>
                    <span className="text-zinc-200 font-bold tabular-nums">{xpInLevel} / 1000 XP</span>
                  </div>
                  <div className="h-2.5 bg-zinc-950 border-2 border-zinc-800 rounded-none overflow-hidden p-0.5">
                    <div
                      className="h-full bg-neon-purple rounded-none transition-all duration-500"
                      style={{ width: `${xpPct}%` }}
                    />
                  </div>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mt-1.5">
                    {1000 - xpInLevel} XP to level {level + 1}
                  </p>
                </div>

                {/* Pro badge */}
                {isPro && (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border-2 border-amber-500/35 rounded-none px-2.5 py-1.5 w-fit font-mono text-[8px] uppercase tracking-wider text-amber-400 shadow-[2px_2px_0px_#000000]">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    <span>Pro Member</span>
                  </div>
                )}

                {/* Sign out */}
                <div className="pt-4 border-t border-zinc-800">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-zinc-500 hover:text-rose-455 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 shrink-0" />
                      <span>Sign out</span>
                    </button>
                  </form>
                </div>
              </div>
            </FantasyPixelCard>

            {/* Quick Stats Card */}
            <FantasyPixelCard theme="purple">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-200">
                  <TrendingUp className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <h2>Statistics</h2>
                </div>

                <div className="space-y-3">
                  {/* ELO */}
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />
                      <span className="text-zinc-400">Rating</span>
                    </div>
                    <span className="font-bold text-amber-400 text-glow-gold">{rating}</span>
                  </div>
                  {/* Winrate */}
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className="text-zinc-400 ml-5.5">Win Rate</span>
                    <span className={`font-bold ${winrate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {winrate}%
                    </span>
                  </div>
                  {/* Games */}
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className="text-zinc-400 ml-5.5">Games Played</span>
                    <span className="font-bold text-zinc-300">{gamesPlayed}</span>
                  </div>

                  {/* W/L/D bar */}
                  <div className="mt-3 pt-4 border-t border-zinc-800">
                    {gamesPlayed > 0 && (
                      <>
                        <div className="flex h-2 bg-zinc-950 border border-zinc-800 rounded-none overflow-hidden gap-0.5 p-0.5">
                          {wins > 0 && <div className="bg-emerald-500 rounded-none" style={{ width: `${(wins / gamesPlayed) * 100}%` }} />}
                          {losses > 0 && <div className="bg-red-500 rounded-none" style={{ width: `${(losses / gamesPlayed) * 100}%` }} />}
                          {draws > 0 && <div className="bg-zinc-600 rounded-none" style={{ width: `${(draws / gamesPlayed) * 100}%` }} />}
                        </div>
                        <div className="flex justify-between mt-2.5 font-mono text-[8px] tracking-wider uppercase text-zinc-500">
                          <span className="text-emerald-500 font-bold">{wins}W</span>
                          <span className="text-red-500 font-bold">{losses}L</span>
                          <span className="font-bold">{draws}D</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </FantasyPixelCard>

          </aside>

          {/* ── RIGHT: Main Content ───────────────────────────────────────── */}
          <main className="flex flex-col gap-6 min-w-0">

            {/* Stats cards row */}
            <StatsCards
              rating={rating}
              gamesPlayed={gamesPlayed}
              wins={wins}
              losses={losses}
              draws={draws}
            />

            {/* Tabs: Lobby / Armory / Progression / Settings */}
            <ProfileTabs
              userId={user.id}
              profile={profile}
              matches={matches || []}
              achievements={achievements || []}
              isPro={isPro}
            />

            {/* Recent Matches */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-white">Recent Matches</h2>
                <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{matches?.length ?? 0}</span>
              </div>
              <RecentMatches matches={matches || []} currentUserId={user.id} currentUserColor="white" />
            </section>

          </main>
        </div>
      </div>
    </main>
  )
}
