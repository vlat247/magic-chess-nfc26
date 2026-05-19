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
  MapPin,
  Zap,
  Star
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// Floating spark particles – rendered server-side as static positions
const SPARKS = [
  { left: '8%',  top: '20%', dur: '2.1s', delay: '0s',    size: 3, color: 'oklch(0.7 0.25 300)' },
  { left: '15%', top: '70%', dur: '2.8s', delay: '0.4s',  size: 2, color: 'oklch(0.7 0.2 195)' },
  { left: '25%', top: '40%', dur: '1.9s', delay: '0.9s',  size: 4, color: 'oklch(0.8 0.18 85)' },
  { left: '40%', top: '85%', dur: '2.5s', delay: '0.2s',  size: 2, color: 'oklch(0.7 0.22 330)' },
  { left: '60%', top: '15%', dur: '2.2s', delay: '1.1s',  size: 3, color: 'oklch(0.7 0.25 300)' },
  { left: '72%', top: '60%', dur: '3.0s', delay: '0.6s',  size: 2, color: 'oklch(0.7 0.2 195)' },
  { left: '85%', top: '35%', dur: '1.7s', delay: '1.5s',  size: 4, color: 'oklch(0.8 0.18 85)' },
  { left: '92%', top: '75%', dur: '2.6s', delay: '0.3s',  size: 2, color: 'oklch(0.7 0.22 330)' },
  { left: '50%', top: '50%', dur: '2.4s', delay: '0.7s',  size: 3, color: 'oklch(0.7 0.25 300)' },
  { left: '33%', top: '10%', dur: '1.6s', delay: '1.3s',  size: 2, color: 'oklch(0.7 0.2 195)' },
  { left: '78%', top: '90%', dur: '2.9s', delay: '0.1s',  size: 3, color: 'oklch(0.8 0.18 85)' },
  { left: '5%',  top: '55%', dur: '2.3s', delay: '1.8s',  size: 2, color: 'oklch(0.7 0.25 300)' },
  { left: '12%', top: '95%', dur: '2.5s', delay: '1.1s',  size: 3, color: 'oklch(0.8 0.18 85)' },
  { left: '88%', top: '15%', dur: '2.1s', delay: '0.4s',  size: 2, color: 'oklch(0.7 0.2 195)' },
  { left: '45%', top: '25%', dur: '2.7s', delay: '1.6s',  size: 3, color: 'oklch(0.7 0.25 300)' },
  { left: '65%', top: '80%', dur: '1.9s', delay: '0.8s',  size: 4, color: 'oklch(0.8 0.18 85)' },
]

const TWINKLES = [
  { left: '20%', top: '30%', dur: '3.2s', delay: '0s'   },
  { left: '45%', top: '65%', dur: '2.8s', delay: '1.2s' },
  { left: '70%', top: '25%', dur: '3.5s', delay: '0.5s' },
  { left: '88%', top: '55%', dur: '2.6s', delay: '0.8s' },
  { left: '12%', top: '80%', dur: '3.0s', delay: '1.6s' },
  { left: '55%', top: '8%',  dur: '2.9s', delay: '0.3s' },
  { left: '35%', top: '85%', dur: '3.1s', delay: '1.0s' },
  { left: '82%', top: '15%', dur: '2.7s', delay: '0.7s' },
]

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

  const rating      = profile?.rating      ?? 1200
  const gamesPlayed = profile?.games_played ?? 0
  const wins        = profile?.wins         ?? 0
  const losses      = profile?.losses       ?? 0
  const draws       = profile?.draws        ?? 0
  const city        = profile?.city
  const level       = profile?.level        ?? 1
  const isPro       = subscription?.status === 'active' || subscription?.plan === 'pro'
  const username    = profile?.username     ?? 'Mage'
  const xp          = profile?.xp           ?? 0
  const xpInLevel   = xp % 1000
  const xpPct       = (xpInLevel / 10).toFixed(1)

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.07_0.025_285)] via-[oklch(0.10_0.03_280)] to-[oklch(0.05_0.01_280)] overflow-x-hidden pt-24 pb-20 px-4">
      <Header />
      <MagicParticles />

      {/* ── Deep background grid ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none z-0 animate-grid"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,2,18,0.95)_100%)] z-0" />

      {/* ── Floating background orbs ────────────────────────────────────── */}
      {/* Orbs removed to eliminate blurry neon aesthetic per design requirements */}

      {/* ── Floating spark particles ────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {SPARKS.map((s, i) => (
          <div
            key={i}
            className="absolute animate-spark rounded-none"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: s.color,
              // Removed box-shadow glow
              '--dur': s.dur,
              animationDelay: s.delay,
            } as React.CSSProperties}
          />
        ))}
        {TWINKLES.map((t, i) => (
          <div
            key={`tw-${i}`}
            className="absolute animate-twinkle text-[10px] select-none font-bold"
            style={{
              left: t.left,
              top: t.top,
              '--dur': t.dur,
              animationDelay: t.delay,
              color: i % 2 === 0 ? 'oklch(0.7 0.25 300 / 0.7)' : 'oklch(0.8 0.18 85 / 0.6)',
              // Removed text-shadow glow
            } as React.CSSProperties}
          >
            {['✦','✧','★','✶','❋','✴'][i % 6]}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-6">

        {/* ── Player Identity Banner ─────────────────────────────────────── */}
        <div
          className={`flex flex-col md:flex-row items-center md:items-center justify-between gap-6 p-6 sm:p-8 border relative overflow-hidden animate-pixel-flicker ${
            isPro
              ? 'border-amber-500 bg-amber-950/20'
              : 'border-purple-500 bg-purple-950/20'
          }`}
          style={{ backdropFilter: 'blur(4px)', boxShadow: '8px 8px 0 rgba(0,0,0,0.6)' }}
        >
          {/* Animated top shimmer bar */}
          <div className="absolute top-0 left-0 right-0 h-px animate-shimmer opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-px animate-shimmer opacity-40" />

          {/* Thick corner brackets – pixel style */}
          <div className={`absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 ${isPro ? 'border-neon-gold' : 'border-neon-purple'}`} />
          <div className={`absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 ${isPro ? 'border-neon-gold' : 'border-neon-purple'}`} />
          <div className={`absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 ${isPro ? 'border-neon-gold' : 'border-neon-purple'}`} />
          <div className={`absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 ${isPro ? 'border-neon-gold' : 'border-neon-purple'}`} />

          {/* Inner secondary brackets */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-muted-foreground/40" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-muted-foreground/40" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-muted-foreground/40" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-muted-foreground/40" />

          {/* Background aura blobs removed for pixel aesthetic */}

          {/* Mini banner sparks */}
          {[
            { left: '5%', top: '30%', color: 'oklch(0.7 0.25 300)' },
            { left: '90%', top: '20%', color: 'oklch(0.8 0.18 85)' },
            { left: '50%', top: '85%', color: 'oklch(0.7 0.2 195)' },
            { left: '80%', top: '70%', color: 'oklch(0.7 0.22 330)' },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute animate-twinkle pointer-events-none text-[8px] font-bold"
              style={{
                left: s.left, top: s.top, color: s.color,
                // Removed text-shadow glow
                '--dur': `${2 + i * 0.6}s`,
                animationDelay: `${i * 0.5}s`,
              } as React.CSSProperties}
            >
              ✦
            </div>
          ))}

          {/* Left: Avatar + summoner details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <AvatarUpload
              uid={user.id}
              url={profile?.avatar_url || null}
              username={profile?.username || null}
              isPro={isPro}
              onUploadComplete={async () => { 'use server' }}
            />

            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="font-mono text-base sm:text-xl font-bold tracking-widest text-foreground">
                  {username}
                </span>
                <span className="font-mono text-[8px] font-bold bg-black border border-neon-cyan/80 px-2.5 py-0.5 text-neon-cyan leading-none tracking-widest uppercase">
                  LVL {level}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {isPro ? (
                  <span
                    className="flex items-center gap-1.5 font-mono text-[8px] font-bold tracking-widest px-3 py-1 border animate-pixel-flicker"
                    style={{
                      color: 'oklch(0.85 0.18 85)',
                      borderColor: 'oklch(0.8 0.18 85)',
                      background: 'black',
                      boxShadow: '2px 2px 0 oklch(0.8 0.18 85 / 0.5)'
                    }}
                  >
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    ✦ ARCHMAGE PRO ✦
                  </span>
                ) : (
                  <span
                    className="font-mono text-[8px] font-bold tracking-widest px-2.5 py-0.5 border"
                    style={{
                      color: 'oklch(0.55 0.06 280)',
                      borderColor: 'oklch(0.3 0.06 300)',
                      background: 'oklch(0.2 0.03 280 / 0.15)'
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

                <span className="font-mono text-[8px] tracking-widest text-muted-foreground/50 uppercase">
                  JOINED {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              </div>

              {/* XP mini bar under name */}
              <div className="flex items-center gap-2 mt-1">
                <Zap className="h-3 w-3 text-neon-cyan shrink-0" />
                <div className="relative w-36 h-1.5 bg-black/60 border border-neon-cyan/20 overflow-hidden">
                  <div
                    className="h-full bg-neon-cyan/80"
                    style={{ width: `${xpPct}%` }}
                  />
                  <div className="absolute inset-0 animate-xp-shimmer opacity-30" />
                </div>
                <span className="font-mono text-[7px] text-muted-foreground/60 tracking-widest">{xp} XP</span>
              </div>
            </div>
          </div>

          {/* Right: Rating, streak and logout */}
          <div className="flex items-center justify-center md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-border/30 pt-4 md:pt-0">
            {/* Win streak badge */}
            {wins > 0 && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-neon-pink" />
                  <span className="font-mono text-xl font-bold text-neon-pink">
                    {wins}
                  </span>
                </div>
                <span className="font-mono text-[7px] font-bold tracking-widest text-muted-foreground/60 uppercase">TOP WINS</span>
              </div>
            )}

            <div className="h-10 w-px bg-border/40" />

            {/* ELO rating */}
            <div className="flex flex-col items-center md:items-end gap-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-neon-gold" />
                <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-neon-gold">
                  {rating}
                </span>
              </div>
              <span className="font-mono text-[7px] font-bold tracking-widest text-muted-foreground/60 uppercase">SUMMONER ELO</span>
            </div>

            <div className="h-10 w-px bg-border/40" />

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-muted-foreground/55 hover:text-destructive transition-all duration-300 cursor-pointer select-none border border-transparent hover:border-destructive/35 hover:bg-destructive/5 px-3 py-2 uppercase"
              >
                <LogOut className="h-3.5 w-3.5" />
                SIGN OUT
              </button>
            </form>
          </div>
        </div>

        {/* ── Player Navigation Dashboard Tabs ─────────────────────────── */}
        <ProfileTabs
          userId={user.id}
          profile={profile}
          matches={matches || []}
          achievements={achievements || []}
          isPro={isPro}
        />

        {/* ── Stats & Duel History ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 items-start">
          {/* Stats Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-neon-gold" />
              <h2 className="font-mono text-[10px] tracking-widest text-neon-gold uppercase font-bold">
                Combat Statistics
              </h2>
              <div className="flex-1 h-px bg-neon-gold/40" />
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
              <div className="flex-1 h-px bg-neon-cyan/40" />
            </div>
            <RecentMatches matches={matches || []} currentUserId={user.id} currentUserColor="white" />
          </div>
        </div>

      </div>
    </main>
  )
}
