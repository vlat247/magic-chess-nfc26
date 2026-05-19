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
    <main className="relative min-h-screen bg-[#0C0F16] overflow-x-hidden pt-28 px-4 flex flex-col">
      <Header />
      <GlobalParticles />

      {/* Grid effects (Muted steel grid) */}
      <div
        className="absolute inset-0 opacity-8 animate-grid pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(141, 153, 174, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(141, 153, 174, 0.08) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(6,8,12,0.99)_100%)] z-0" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-10 flex-grow pb-16">
        
        {/* Title details (Retro pixel badge and header style) */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 flex items-center justify-center bg-[#FACC15]/10 border-2 border-[#FACC15] shadow-[4px_4px_0px_#000000] rounded-none mb-4">
            <Trophy className="h-6 w-6 text-[#FACC15]" />
          </div>
          
          <h1 
            className="font-title text-4xl sm:text-5xl text-[#FACC15] text-glow-gold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-jacquard)' }}
          >
            HALL OF MASTERS
          </h1>
          
          <p className="font-mono text-[9px] tracking-widest text-[#8D99AE] uppercase max-w-md leading-relaxed mt-1">
            Review the ELO rating statistics and competitive streaks of active spellcasters across the global realm.
          </p>
        </div>

        {/* Tab display */}
        <LeaderboardTabs initialUsers={leaderboardUsers} currentUser={user} />

      </div>
      <Footer variant="grey" className="relative z-10 mt-auto w-full" />
    </main>
  )
}
