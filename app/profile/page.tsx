import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/profile/stats-cards'
import { RecentMatches } from '@/components/profile/recent-matches'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { Header } from '@/components/arcane-chess/header'
import { MagicParticles } from '@/components/arcane-chess/magic-particles'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { logout } from '@/actions/auth'
import {
  ShieldCheck,
  LogOut,
  Trophy,
  Swords,
  Star,
  MapPin
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

  // Fetch complete profile info
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)

  // Fetch recent matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch active subscriptions
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

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)] overflow-x-hidden pt-24 pb-16 px-4">
      <Header />
      <MagicParticles />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(10,5,25,0.8)_100%)] z-0" />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-8">

        {/* ── Player Identity Banner ───────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border border-[oklch(0.22_0.06_300)] bg-[oklch(0.09_0.025_280)]"
          style={{ boxShadow: '0 0 35px oklch(0.7 0.25 300 / 0.08)' }}
        >
          {/* Avatar + summoner details */}
          <div className="flex items-center gap-4">
            <AvatarUpload
              uid={user.id}
              url={profile?.avatar_url || null}
              username={profile?.username || null}
              onUploadComplete={async () => {
                'use server'
              }}
            />
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="font-sans text-sm font-bold tracking-widest text-foreground"
                >
                  {username}
                </span>

                <span className="font-mono text-[8px] bg-zinc-950 border border-muted-foreground/30 px-2 py-0.5 rounded-full text-foreground/80 leading-none">
                  LVL {level}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {isPro ? (
                  <span
                    className="flex items-center gap-1 font-mono text-[8px] tracking-widest px-2 py-0.5 border"
                    style={{
                      color: 'oklch(0.8 0.18 85)',
                      borderColor: 'oklch(0.8 0.18 85 / 0.4)',
                      background: 'oklch(0.8 0.18 85 / 0.08)',
                    }}
                  >
                    <ShieldCheck className="h-2.5 w-2.5" />
                    ARCHMAGE PRO
                  </span>
                ) : (
                  <span
                    className="font-mono text-[8px] tracking-widest px-2 py-0.5 border"
                    style={{
                      color: 'oklch(0.6 0.05 280)',
                      borderColor: 'oklch(0.25 0.04 280)',
                    }}
                  >
                    MAGE INITIATE
                  </span>
                )}

                {city && (
                  <span className="font-mono text-[8px] tracking-widest text-neon-cyan flex items-center gap-0.5 uppercase">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {city}
                  </span>
                )}

                <span className="font-mono text-[8px] tracking-widest text-muted-foreground">
                  JOINED {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Rating, streak and logout */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3 w-3 text-neon-gold" />
                <span
                  className="font-mono text-2xl font-bold tabular-nums text-neon-gold"
                  style={{ textShadow: '0 0 12px oklch(0.8 0.18 85 / 0.6)' }}
                >
                  {rating}
                </span>
              </div>
              <span className="font-mono text-[8px] tracking-widest text-muted-foreground">ELO RATING</span>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-muted-foreground hover:text-destructive transition-colors cursor-pointer select-none"
              >
                <LogOut className="h-3.5 w-3.5" />
                SIGN OUT
              </button>
            </form>
          </div>
        </div>

        {/* ── Player Navigation Dashboard Tabs ───────────────────────────── */}
        <ProfileTabs
          userId={user.id}
          profile={profile}
          matches={matches || []}
          achievements={achievements || []}
          isPro={isPro}
        />

        {/* ── Stats & Duel History ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          {/* Stats Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-neon-gold" style={{ filter: 'drop-shadow(0 0 6px oklch(0.8 0.18 85))' }} />
              <h2 className="font-mono text-xs tracking-widest text-neon-gold uppercase">
                Combat Data
              </h2>
              <div className="flex-1 h-px bg-neon-gold opacity-20" />
            </div>
            <StatsCards
              rating={rating}
              gamesPlayed={gamesPlayed}
              wins={wins}
              losses={losses}
              draws={draws}
            />
          </div>

          {/* Matches List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 flex items-center justify-center font-bold text-neon-cyan">⚔</div>
              <h2 className="font-mono text-xs tracking-widest text-neon-cyan uppercase">
                Chronicles of Battle
              </h2>
              <div className="flex-1 h-px bg-neon-cyan opacity-20" />
            </div>
            <RecentMatches matches={matches || []} currentUserId={user.id} currentUserColor="white" />
          </div>
        </div>

      </div>
    </main>
  )
}
