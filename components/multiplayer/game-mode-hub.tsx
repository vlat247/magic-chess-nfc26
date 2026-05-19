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
    accentColor: 'text-[#8D99AE]',
  },
  {
    level: 'easy',
    label: 'Novice AI',
    desc: 'A gentle sparring partner',
    accentColor: 'text-[#8D99AE]',
  },
  {
    level: 'medium',
    label: 'Adept AI',
    desc: 'A balanced challenge',
    accentColor: 'text-[#BFC7D5]',
  },
  {
    level: 'hard',
    label: 'Master AI',
    desc: 'Relentless and merciless',
    accentColor: 'text-[#FACC15]',
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
      <div className="flex border-b-2 border-[#2D3748] mb-5 bg-[#2D3748]/30 backdrop-blur-md rounded-none font-mono text-[9px] tracking-widest uppercase">
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
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold cursor-pointer transition-all duration-300 relative uppercase rounded-none
                ${isActive
                  ? 'border-[#BFC7D5] text-[#BFC7D5] bg-[#BFC7D5]/5'
                  : 'border-transparent text-[#8D99AE] hover:text-[#BFC7D5] hover:bg-[#2D3748]/20'
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
                <p className="text-[9px] font-mono text-[#8D99AE] uppercase tracking-widest leading-relaxed">
                  Select your opponent type, then enter the battle.
                </p>

                {/* AI level grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {AI_LEVELS.map(({ level, label, desc, accentColor }) => {
                    const isSelected = selectedAi === level
                    
                    // Difficulty colors for retro pixel theme
                    let themeBorder = 'border-[#4A5568] bg-[#2D3748]/20 hover:border-[#8D99AE]'
                    let cornerColor = 'bg-[#4A5568]/40 group-hover:bg-[#8D99AE]/40'
                    if (isSelected) {
                      if (level === 'none') {
                        themeBorder = 'border-[#4A5568] bg-[#4A5568]/10 text-[#8D99AE] shadow-[4px_4px_0px_#000000]'
                        cornerColor = 'bg-[#4A5568]'
                      } else if (level === 'easy') {
                        themeBorder = 'border-[#8D99AE] bg-[#8D99AE]/10 text-[#8D99AE] shadow-[4px_4px_0px_#000000]'
                        cornerColor = 'bg-[#8D99AE]'
                      } else if (level === 'medium') {
                        themeBorder = 'border-[#BFC7D5] bg-[#BFC7D5]/10 text-[#BFC7D5] shadow-[4px_4px_0px_#000000]'
                        cornerColor = 'bg-[#BFC7D5]'
                      } else if (level === 'hard') {
                        themeBorder = 'border-[#FACC15] bg-[#FACC15]/10 text-[#FACC15] shadow-[4px_4px_0px_#000000]'
                        cornerColor = 'bg-[#FACC15]'
                      }
                    }

                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedAi(level)}
                        id={`ai-level-${level}`}
                        className={`relative flex flex-col gap-1.5 p-4 border-2 text-left transition-all duration-200 cursor-pointer rounded-none group
                          ${themeBorder}
                        `}
                      >
                        {/* Corner notched pixel blocks */}
                        <div className={`absolute top-1.5 left-1.5 w-1 h-1 transition-colors ${cornerColor}`} />
                        <div className={`absolute top-1.5 right-1.5 w-1 h-1 transition-colors ${cornerColor}`} />
                        <div className={`absolute bottom-1.5 left-1.5 w-1 h-1 transition-colors ${cornerColor}`} />
                        <div className={`absolute bottom-1.5 right-1.5 w-1 h-1 transition-colors ${cornerColor}`} />

                        <div className="flex items-center justify-between">
                          <div className={`p-1.5 rounded-none bg-[#1E2530] border-2 border-[#4A5568] transition-colors ${isSelected ? accentColor : 'text-[#4A5568]'}`}>
                            {level === 'none'
                              ? <UserIcon className="h-3.5 w-3.5 shrink-0" />
                              : <Bot className="h-3.5 w-3.5 shrink-0" />
                            }
                          </div>
                          {isSelected && (
                            <span className={`text-[10px] font-bold ${accentColor}`}>✓</span>
                          )}
                        </div>
                        <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-zinc-100' : 'text-[#8D99AE]'}`}>
                          {label}
                        </span>
                        <span className={`text-[9px] font-sans leading-normal ${isSelected ? 'text-[#BFC7D5]' : 'text-[#4A5568]'}`}>
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
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 bg-[#8D99AE] hover:bg-[#A3B0C7] text-zinc-950 font-mono font-bold text-[9px] sm:text-[10px] tracking-widest cursor-pointer transition-all uppercase rounded-none border-2 border-zinc-950 shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]"
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
