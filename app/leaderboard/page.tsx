import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/arcane-chess/header'
import { Footer } from '@/components/arcane-chess/footer'
import { GlobalParticles } from '@/components/arcane-chess/global-particles'
import { LeaderboardTabs } from '@/components/leaderboard/leaderboard-tabs'
import { Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // 1. Fetch current authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch all registered users, sorted by ELO
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('rating', { ascending: false })
    .order('wins', { ascending: false })


  // 3. Fetch active subscriptions to mark Pro members
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, status, plan')
    .eq('status', 'active')

  // Create a quick map of active Pro user IDs
  const proUserMap = new Map()
  subscriptions?.forEach(sub => {
    proUserMap.set(sub.user_id, true)
  })

  // Format users for the client component
  const leaderboardUsers = (users || []).map(u => ({
    ...u,
    is_pro: proUserMap.has(u.id) || u.unlocked_board_skins?.includes('molten-core') // Check sub table or skin lock status
  }))

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)] overflow-x-hidden pt-28 pb-16 px-4">
      <Header />
      <GlobalParticles />

      {/* Grid effects */}
      <div
        className="absolute inset-0 opacity-10 animate-grid pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,25,0.9)_100%)] z-0" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-10">
        
        {/* Title details */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 flex items-center justify-center bg-neon-cyan/10 border border-neon-cyan/50 glow-cyan mb-2">
            <Trophy className="h-6 w-6 text-neon-cyan animate-pulse" />
          </div>
          
          <h1 
            className="font-title text-4xl sm:text-5xl text-neon-cyan text-glow-cyan tracking-wide"
            style={{ fontFamily: 'var(--font-jacquard)' }}
          >
            HALL OF MASTERS
          </h1>
          
          <p className="font-sans text-[10px] tracking-widest text-muted-foreground uppercase max-w-md">
            Review the ELO rating statistics and competitive streaks of active spellcasters across the global realm.
          </p>
        </div>

        {/* Tab display */}
        <LeaderboardTabs initialUsers={leaderboardUsers} currentUser={user} />

      </div>
      <Footer />
    </main>
  )
}
