import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/profile/stats-cards'
import { RecentMatches } from '@/components/profile/recent-matches'
import { Header } from '@/components/arcane-chess/header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { logout } from '@/actions/auth'
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
    <main className="relative min-h-screen bg-[#0a0a0f] overflow-x-hidden pt-20 pb-16">
      <Header />

      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-amber-950/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.08),transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* ── LEFT SIDEBAR: Player Card ─────────────────────────────────── */}
          <aside className="flex flex-col gap-4">

            {/* Identity Card */}
            <div className="bg-zinc-900/70 border border-white/[0.06] rounded-2xl backdrop-blur-md p-5 flex flex-col gap-4">

              {/* Name + Level */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-white truncate">{username}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {city && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {city}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-zinc-600">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {joinDate}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-1.5">
                  <span className="text-lg font-bold text-violet-400 leading-none">{level}</span>
                  <span className="text-[9px] text-violet-500/60 uppercase tracking-wider mt-0.5">Lvl</span>
                </div>
              </div>

              {/* XP Bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-violet-400" />
                    Experience
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium tabular-nums">{xpInLevel} / 1000 XP</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">{1000 - xpInLevel} XP to level {level + 1}</p>
              </div>

              {/* Pro badge */}
              {isPro && (
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 w-fit">
                  <ShieldCheck className="h-3 w-3 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400">Pro Member</span>
                </div>
              )}

              {/* Sign out */}
              <div className="pt-3 border-t border-white/[0.05]">
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>


            {/* Quick Stats Card */}
            <div className="bg-zinc-900/70 border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-white">Statistics</h2>
              </div>

              <div className="space-y-3">
                {/* ELO */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-zinc-400">Rating</span>
                  </div>
                  <span className="text-sm font-bold text-amber-400">{rating}</span>
                </div>
                {/* Winrate */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 ml-6">Win Rate</span>
                  <span className={`text-sm font-bold ${winrate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {winrate}%
                  </span>
                </div>
                {/* Games */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 ml-6">Games Played</span>
                  <span className="text-sm font-bold text-zinc-300">{gamesPlayed}</span>
                </div>

                {/* W/L/D bar */}
                <div className="mt-2 pt-3 border-t border-white/[0.05]">
                  {gamesPlayed > 0 && (
                    <>
                      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                        <div className="bg-emerald-500 rounded-full" style={{ width: `${(wins / gamesPlayed) * 100}%` }} />
                        <div className="bg-red-500 rounded-full" style={{ width: `${(losses / gamesPlayed) * 100}%` }} />
                        <div className="bg-zinc-600 rounded-full" style={{ width: `${(draws / gamesPlayed) * 100}%` }} />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-zinc-500">
                        <span className="text-emerald-500 font-medium">{wins}W</span>
                        <span className="text-red-500 font-medium">{losses}L</span>
                        <span className="font-medium">{draws}D</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

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
