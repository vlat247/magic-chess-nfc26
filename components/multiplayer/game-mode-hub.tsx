'use client'

/**
 * GameModeHub — client island for the profile/lobby page.
 * Handles all interactive mode switching: Local / AI / Online Multiplayer.
 * Navigates to /play for the actual board, or /play/room/[id] for multiplayer.
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Cpu, Users, Swords, Zap, Plus, ArrowRight, Loader2, Bot, UserIcon, Clock } from 'lucide-react'
import { LobbyPanel } from '@/components/multiplayer/lobby-panel'

type Tab = 'local' | 'online'
type AiLevel = 'none' | 'easy' | 'medium' | 'hard'

interface GameModeHubProps {
  userId: string
  username: string
}

const AI_LEVELS: { 
  level: AiLevel; 
  label: string; 
  desc: string; 
  accentColor: string; 
  activeBorder: string; 
  activeBg: string; 
}[] = [
  { 
    level: 'none', 
    label: 'LOCAL PVP', 
    desc: 'Pass & play vs a friend', 
    accentColor: 'text-cyan-400', 
    activeBorder: 'border-cyan-400', 
    activeBg: 'bg-cyan-950/20'
  },
  { 
    level: 'easy', 
    label: 'NOVICE AI', 
    desc: 'Gentle sparring partner', 
    accentColor: 'text-emerald-400', 
    activeBorder: 'border-emerald-400', 
    activeBg: 'bg-emerald-950/20'
  },
  { 
    level: 'medium', 
    label: 'ADEPT AI', 
    desc: 'A fair challenge', 
    accentColor: 'text-amber-400', 
    activeBorder: 'border-amber-400', 
    activeBg: 'bg-amber-950/15'
  },
  { 
    level: 'hard', 
    label: 'MASTER AI', 
    desc: 'Merciless engine', 
    accentColor: 'text-rose-400', 
    activeBorder: 'border-rose-400', 
    activeBg: 'bg-rose-950/15'
  },
]

export function GameModeHub({ userId, username }: GameModeHubProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('local')
  const [selectedAi, setSelectedAi] = useState<AiLevel>('none')

  const handlePlayLocal = () => {
    // Store chosen AI level in sessionStorage for /play page to read
    sessionStorage.setItem('chess_ai_level', selectedAi)
    router.push('/play')
  }

  return (
    <div className="border border-slate-700/90 bg-[oklch(0.145_0.015_280)] overflow-hidden">
      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-700/90 bg-black/15">
        {([
          { key: 'local' as Tab, label: 'LOCAL & AI', icon: <Cpu className="h-3 w-3" /> },
          { key: 'online' as Tab, label: 'ONLINE', icon: <Users className="h-3 w-3" /> },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            id={`hub-tab-${tab.key}`}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-mono text-[10px] tracking-widest transition-all duration-200 border-b-2
              ${activeTab === tab.key
                ? 'border-slate-300 text-slate-100 bg-slate-800/25 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/3'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ── LOCAL / AI TAB ──────────────────────────────────────────────── */}
        {activeTab === 'local' && (
          <div className="flex flex-col gap-6">
            <p className="font-mono text-[9px] tracking-widest text-slate-400">
              SELECT OPPONENT TYPE, THEN ENTER THE BATTLEFIELD.
            </p>

            {/* AI level grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AI_LEVELS.map(({ level, label, desc, accentColor, activeBorder, activeBg }) => {
                const isSelected = selectedAi === level
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedAi(level)}
                    id={`ai-level-${level}`}
                    className={`relative flex flex-col gap-2 p-5 border text-left transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] select-none cursor-pointer rounded-none
                      ${isSelected 
                        ? `${activeBorder} ${activeBg} shadow-sm` 
                        : `border-slate-700/30 bg-slate-900/30 hover:border-slate-650 hover:bg-slate-900/50`
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1 bg-black/35 rounded-none border border-slate-700/40 ${isSelected ? accentColor : 'text-slate-400'}`}>
                        {level === 'none'
                          ? <UserIcon className="h-4 w-4 shrink-0" />
                          : <Bot className="h-4 w-4 shrink-0" />
                        }
                      </div>
                      <span className={`font-mono text-xs tracking-widest font-bold transition-colors ${isSelected ? 'text-slate-100' : 'text-slate-400'}`}>
                        {label}
                      </span>
                      {isSelected && (
                        <span className={`ml-auto font-mono text-[8px] tracking-widest font-bold ${accentColor} bg-black/45 border border-current px-2.5 py-0.5`}>
                          SELECTED ✓
                        </span>
                      )}
                    </div>
                    
                    <span className={`font-mono text-[8px] tracking-widest transition-colors ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {desc}
                    </span>

                    {/* Corner Accent for selected card */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-current" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Enter battle button */}
            <button
              onClick={handlePlayLocal}
              id="enter-battle-btn"
              className="flex items-center justify-center gap-3 py-4 border border-purple-500/50 bg-purple-950/20 text-purple-400 hover:text-white font-mono text-xs font-bold tracking-widest transition-all duration-200 hover:bg-purple-900/30 hover:border-purple-400 hover:scale-[1.005] active:scale-[0.995] select-none cursor-pointer rounded-none relative group"
            >
              <Swords className="h-4 w-4 shrink-0" />
              <span>ENTER BATTLEFIELD</span>
            </button>
          </div>
        )}

        {/* ── ONLINE TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'online' && (
          <LobbyPanel userId={userId} username={username} />
        )}
      </div>
    </div>
  )
}
