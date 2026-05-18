import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/profile/stats-cards'
import { RecentMatches } from '@/components/profile/recent-matches'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { Button } from '@/components/ui/button'
import { logout } from '@/actions/auth'
import { ShieldCheck, LogOut, ArrowLeft, Swords } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch complete profile details
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch subscription details
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

  // Server action to trigger refresh on change
  const refreshUser = async () => {
    'use server'
    // This is just a dummy to force Server Component re-evaluation or router refresh
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      {/* Mystical backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-900">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-sm"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Lobby</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/play">
              <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold text-sm border-none shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2">
                <Swords className="h-4 w-4" />
                Duel Now
              </Button>
            </Link>
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-900/50 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 p-6 rounded-xl border border-slate-900 bg-slate-900/20 backdrop-blur-md">
          <AvatarUpload
            uid={user.id}
            url={profile?.avatar_url || null}
            username={profile?.username || null}
            onUploadComplete={async (newUrl) => {
              'use server'
              // Client triggers page refresh when upload finishes
            }}
          />

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Account Status
              </span>
              {isPro ? (
                <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <ShieldCheck className="h-3 w-3" />
                  Archmage Pro
                </span>
              ) : (
                <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded-full">
                  Mage Initiate
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Joined the Sanctum: {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <StatsCards
            rating={rating}
            gamesPlayed={gamesPlayed}
            wins={wins}
            losses={losses}
            draws={draws}
          />
        </div>

        {/* Recent Matches Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Arcane Duel History
          </h2>
          <RecentMatches matches={matches || []} currentUserId={user.id} currentUserColor="white" />
        </div>
      </div>
    </div>
  )
}
