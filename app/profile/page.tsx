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
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.1_0.03_280)] to-[oklch(0.05_0.01_280)] overflow-x-hidden pt-24 pb-16 px-4">
      <Header />
      <MagicParticles />

      {/* Retro Sci-Fi Grid overlays */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-25 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,5,25,0.9)_100%)] z-0" />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-6">

        {/* ── Player Identity Banner ───────────────────────────────────────── */}
        <div
          className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 p-6 sm:p-8 border border-border/80 bg-gradient-to-r from-card/45 via-card/15 to-card/45 backdrop-blur-lg relative overflow-hidden"
          style={{ boxShadow: '0 8px 32px oklch(0.7 0.25 300 / 0.05)' }}
        >
          {/* Subtle light aura */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-neon-purple/5 blur-3xl" />
          {isPro && <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-neon-gold/5 blur-3xl" />}

          {/* Border accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-muted-foreground/30" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-muted-foreground/30" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-muted-foreground/30" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-muted-foreground/30" />

          {/* Left: Avatar + summoner details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group">
              {/* Outer rotating/pulsing ring */}
              <div className={`absolute -inset-1 rounded-full blur-[3px] opacity-70 transition duration-1000 group-hover:duration-200 ${isPro ? 'bg-gradient-to-r from-neon-gold to-amber-500 animate-pulse' : 'bg-gradient-to-r from-neon-purple to-neon-cyan animate-pulse'}`} />
              <div className="relative bg-black rounded-full p-0.5">
                <AvatarUpload
                  uid={user.id}
                  url={profile?.avatar_url || null}
                  username={profile?.username || null}
                  onUploadComplete={async () => {
                    'use server'
                  }}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-bold tracking-widest text-foreground text-glow">
                  {username}
                </span>

                <span className="font-mono text-[8px] font-bold bg-black/60 border border-border px-2.5 py-0.5 rounded-none text-neon-cyan leading-none tracking-widest uppercase">
                  LVL {level}
                </span>
              </div>
              
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                {isPro ? (
                  <span
                    className="flex items-center gap-1 font-mono text-[8px] font-bold tracking-widest px-2.5 py-0.5 border animate-pulse-glow"
                    style={{
                      color: 'oklch(0.8 0.18 85)',
                      borderColor: 'oklch(0.8 0.18 85 / 0.5)',
                      background: 'oklch(0.8 0.18 85 / 0.08)',
                      textShadow: '0 0 4px oklch(0.8 0.18 85 / 0.4)'
                    }}
                  >
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    ARCHMAGE PRO
                  </span>
                ) : (
                  <span
                    className="font-mono text-[8px] font-bold tracking-widest px-2.5 py-0.5 border"
                    style={{
                      color: 'oklch(0.6 0.05 280)',
                      borderColor: 'oklch(0.3 0.06 300)',
                      background: 'oklch(0.2 0.03 280 / 0.1)'
                    }}
                  >
                    MAGE INITIATE
                  </span>
                )}

                {city && (
                  <span className="font-mono text-[8px] font-bold tracking-widest text-neon-cyan flex items-center gap-1 uppercase bg-neon-cyan/5 px-2.5 py-0.5 border border-neon-cyan/20">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {city}
                  </span>
                )}

                <span className="font-mono text-[8px] tracking-widest text-muted-foreground/60 uppercase">
                  JOINED {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Rating, streak and logout */}
          <div className="flex items-center justify-center md:justify-end gap-8 w-full md:w-auto border-t md:border-t-0 border-border/40 pt-4 md:pt-0">
            <div className="flex flex-col items-center md:items-end gap-1.5">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-neon-gold filter drop-shadow-[0_0_4px_oklch(0.8_0.18_85)]" />
                <span
                  className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-neon-gold text-glow-gold"
                >
                  {rating}
                </span>
              </div>
              <span className="font-mono text-[8px] font-bold tracking-widest text-muted-foreground/65 uppercase">SUMMONER ELO</span>
            </div>

            <div className="h-10 w-px bg-border/45" />

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-muted-foreground/60 hover:text-destructive transition-all duration-300 cursor-pointer select-none border border-transparent hover:border-destructive/35 hover:bg-destructive/5 px-3 py-2 uppercase"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 items-start">
          {/* Stats Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-neon-gold" style={{ filter: 'drop-shadow(0 0 6px oklch(0.8 0.18 85))' }} />
              <h2 className="font-mono text-[10px] tracking-widest text-neon-gold uppercase font-bold">
                Combat Statistics
              </h2>
              <div className="flex-1 h-px bg-neon-gold opacity-15" />
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
              <span className="h-4 w-4 flex items-center justify-center font-bold text-neon-cyan">⚔</span>
              <h2 className="font-mono text-[10px] tracking-widest text-neon-cyan uppercase font-bold">
                Chronicles of Battle
              </h2>
              <div className="flex-1 h-px bg-neon-cyan opacity-15" />
            </div>
            <RecentMatches matches={matches || []} currentUserId={user.id} currentUserColor="white" />
          </div>
        </div>

      </div>
    </main>
  )
}
