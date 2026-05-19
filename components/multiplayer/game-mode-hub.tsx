'use client'

/**
 * GameModeHub — client island for the profile/lobby page.
 * Handles all interactive mode switching: Local / AI / Online Multiplayer.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cpu, Users, Swords, Bot, UserIcon } from 'lucide-react'
import { LobbyPanel } from '@/components/multiplayer/lobby-panel'
import { FantasyPixelCard } from '@/components/ui/fantasy-pixel-card'

type Tab = 'local' | 'online'
type AiLevel = 'none' | 'easy' | 'medium' | 'hard'

interface GameModeHubProps {
  userId: string
  username: string
}

const AI_LEVELS: {
  level: AiLevel
  label: string
  desc: string
  accentColor: string
}[] = [
  {
    level: 'none',
    label: 'Local PvP',
    desc: 'Pass & play with a friend',
    accentColor: 'text-zinc-300',
  },
  {
    level: 'easy',
    label: 'Novice AI',
    desc: 'A gentle sparring partner',
    accentColor: 'text-emerald-400',
  },
  {
    level: 'medium',
    label: 'Adept AI',
    desc: 'A balanced challenge',
    accentColor: 'text-amber-400',
  },
  {
    level: 'hard',
    label: 'Master AI',
    desc: 'Relentless and merciless',
    accentColor: 'text-rose-400',
  },
]

export function GameModeHub({ userId, username }: GameModeHubProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('local')
  const [selectedAi, setSelectedAi] = useState<AiLevel>('none')

  const handlePlayLocal = () => {
    sessionStorage.setItem('chess_ai_level', selectedAi)
    router.push('/play')
  }

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.08] mb-5 bg-zinc-950/20 backdrop-blur-md rounded-t-xl font-mono text-[9px] tracking-widest uppercase">
        {([
          { key: 'local' as Tab, label: 'Local & AI', icon: <Cpu className="h-3.5 w-3.5" /> },
          { key: 'online' as Tab, label: 'Online', icon: <Users className="h-3.5 w-3.5" /> },
        ]).map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              id={`hub-tab-${tab.key}`}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-300 relative uppercase
                ${isActive
                  ? 'border-white text-white bg-white/[0.02]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      <div>
        {/* LOCAL / AI TAB */}
        {activeTab === 'local' && (
          <div className="flex flex-col gap-4">
            <FantasyPixelCard theme="purple" title="SPARRING ARENA">
              <div className="flex flex-col gap-4 p-1">
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-relaxed">
                  Select your opponent type, then enter the battle.
                </p>

                {/* AI level grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {AI_LEVELS.map(({ level, label, desc, accentColor }) => {
                    const isSelected = selectedAi === level
                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedAi(level)}
                        id={`ai-level-${level}`}
                        className={`relative flex flex-col gap-1.5 p-4 border text-left transition-all duration-300 cursor-pointer rounded-xl group
                          ${isSelected
                            ? 'border-white/30 bg-zinc-900/40 shadow-sm'
                            : 'border-white/[0.06] bg-zinc-950/20 hover:border-white/20 hover:bg-zinc-900/30'
                          }
                        `}
                      >
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-hover:border-white/20 transition-colors" />
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/10 group-hover:border-white/20 transition-colors" />

                        <div className="flex items-center justify-between">
                          <div className={`p-1.5 rounded-lg bg-zinc-950 border border-white/[0.06] group-hover:border-white/10 transition-colors ${isSelected ? accentColor : 'text-zinc-500'}`}>
                            {level === 'none'
                              ? <UserIcon className="h-3.5 w-3.5 shrink-0" />
                              : <Bot className="h-3.5 w-3.5 shrink-0" />
                            }
                          </div>
                          {isSelected && (
                            <span className={`text-[10px] font-bold ${accentColor}`}>✓</span>
                          )}
                        </div>
                        <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-zinc-100' : 'text-zinc-400'}`}>
                          {label}
                        </span>
                        <span className={`text-[9px] font-sans leading-normal ${isSelected ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {desc.toLowerCase()}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Play button */}
                <button
                  onClick={handlePlayLocal}
                  id="enter-battle-btn"
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-[9px] sm:text-[10px] tracking-widest cursor-pointer active:scale-[0.98] transition-all uppercase rounded shadow"
                >
                  <Swords className="h-4 w-4" />
                  ENTER BATTLE
                </button>
              </div>
            </FantasyPixelCard>
          </div>
        )}

        {/* ONLINE TAB */}
        {activeTab === 'online' && (
          <LobbyPanel userId={userId} username={username} />
        )}
      </div>
    </div>
  )
}
