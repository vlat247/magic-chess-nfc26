import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/profile/stats-cards'
import { RecentMatches } from '@/components/profile/recent-matches'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { GameModeHub } from '@/components/multiplayer/game-mode-hub'
import { Header } from '@/components/arcane-chess/header'
import { MagicParticles } from '@/components/arcane-chess/magic-particles'
import { logout } from '@/actions/auth'
import {
  ShieldCheck,
  LogOut,
  Trophy,
  Swords,
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
  const isPro = subscription?.status === 'active' || subscription?.plan === 'pro'
  const username = profile?.username ?? 'Mage'

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)] overflow-x-hidden pt-24 pb-16 px-4">
      <Header />
      <MagicParticles />

      {/* Pixel grid overlay */}
      <div
        className="absolute inset-0 opacity-10 animate-grid pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-25 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(10,5,25,0.8)_100%)] z-0" />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-10">

        {/* ── Player Identity Bar ───────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-[oklch(0.22_0.06_300)] bg-[oklch(0.09_0.025_280)]"
          style={{ boxShadow: '0 0 30px oklch(0.7 0.25 300 / 0.08)' }}
        >
          {/* Avatar + name */}
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
              <span
                className="font-mono text-sm tracking-widest"
                style={{ color: 'oklch(0.9 0.05 280)' }}
              >
                {username}
              </span>
              <div className="flex items-center gap-2">
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
                <span className="font-mono text-[8px] tracking-widest text-muted-foreground">
                  JOINED {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Rating + logout */}
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
                className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                SIGN OUT
              </button>
            </form>
          </div>
        </div>

        {/* ── Game Mode Hub (main play area) ────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Swords className="h-4 w-4 text-neon-purple" style={{ filter: 'drop-shadow(0 0 6px oklch(0.7 0.25 300))' }} />
            <h2 className="font-mono text-xs tracking-widest text-neon-purple" style={{ textShadow: '0 0 10px oklch(0.7 0.25 300 / 0.5)' }}>
              CHOOSE YOUR BATTLE
            </h2>
            <div className="flex-1 h-px bg-neon-purple opacity-20" />
          </div>
          {/* Client component handles all interactive mode switching */}
          <GameModeHub userId={user.id} username={username} />
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-4 w-4 text-neon-gold" style={{ filter: 'drop-shadow(0 0 6px oklch(0.8 0.18 85))' }} />
            <h2 className="font-mono text-xs tracking-widest text-neon-gold" style={{ textShadow: '0 0 10px oklch(0.8 0.18 85 / 0.5)' }}>
              BATTLE STATISTICS
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
        </section>

        {/* ── Match History ─────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 flex items-center justify-center"
              style={{ color: 'oklch(0.7 0.2 195)' }}
            >
              ⚔
            </div>
            <h2 className="font-mono text-xs tracking-widest text-neon-cyan" style={{ textShadow: '0 0 10px oklch(0.7 0.2 195 / 0.5)' }}>
              DUEL HISTORY
            </h2>
            <div className="flex-1 h-px bg-neon-cyan opacity-20" />
          </div>
          <RecentMatches matches={matches || []} currentUserId={user.id} currentUserColor="white" />
        </section>

      </div>
    </main>
  )
}
