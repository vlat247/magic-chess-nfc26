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

const AI_LEVELS: { level: AiLevel; label: string; desc: string; color: string }[] = [
  { level: 'none', label: 'LOCAL PVP', desc: 'Pass & play vs a friend', color: 'text-neon-cyan border-neon-cyan/40 hover:bg-neon-cyan/5' },
  { level: 'easy', label: 'NOVICE AI', desc: 'Gentle sparring partner', color: 'text-emerald-400 border-emerald-400/40 hover:bg-emerald-400/5' },
  { level: 'medium', label: 'ADEPT AI', desc: 'A fair challenge', color: 'text-neon-gold border-neon-gold/40 hover:bg-neon-gold/5' },
  { level: 'hard', label: 'MASTER AI', desc: 'Merciless engine', color: 'text-rose-400 border-rose-400/40 hover:bg-rose-400/5' },
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
    <div
      className="border border-[oklch(0.2_0.04_280)] bg-[oklch(0.085_0.02_280)] overflow-hidden"
      style={{ boxShadow: '0 0 40px oklch(0.7 0.25 300 / 0.06)' }}
    >
      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-[oklch(0.18_0.04_280)]">
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
                ? 'border-neon-purple text-neon-purple bg-neon-purple/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/3'
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
            <p className="font-mono text-[9px] tracking-widest text-muted-foreground">
              SELECT OPPONENT TYPE, THEN ENTER THE BATTLEFIELD.
            </p>

            {/* AI level grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AI_LEVELS.map(({ level, label, desc, color }) => (
                <button
                  key={level}
                  onClick={() => setSelectedAi(level)}
                  id={`ai-level-${level}`}
                  className={`relative flex flex-col gap-1.5 p-4 border-2 text-left transition-all duration-200 ${color}
                    ${selectedAi === level ? 'opacity-100' : 'opacity-50 hover:opacity-80'}
                  `}
                  style={selectedAi === level ? {
                    boxShadow: level === 'none'
                      ? '0 0 15px oklch(0.7 0.2 195 / 0.2)'
                      : level === 'easy'
                        ? '0 0 15px oklch(0.7 0.2 140 / 0.2)'
                        : level === 'medium'
                          ? '0 0 15px oklch(0.8 0.18 85 / 0.2)'
                          : '0 0 15px oklch(0.65 0.22 20 / 0.25)',
                  } : {}}
                >
                  <div className="flex items-center gap-2">
                    {level === 'none'
                      ? <UserIcon className="h-3.5 w-3.5" />
                      : <Bot className="h-3.5 w-3.5" />
                    }
                    <span className="font-mono text-xs tracking-widest font-bold">{label}</span>
                    {selectedAi === level && (
                      <span className="ml-auto font-mono text-[8px] tracking-widest opacity-80">SELECTED ✓</span>
                    )}
                  </div>
                  <span className="font-mono text-[8px] tracking-widest opacity-70">{desc}</span>
                </button>
              ))}
            </div>

            {/* Enter battle button */}
            <button
              onClick={handlePlayLocal}
              id="enter-battle-btn"
              className="flex items-center justify-center gap-3 py-4 border-2 border-neon-purple text-neon-purple font-mono text-xs tracking-widest transition-all duration-200 hover:bg-neon-purple/10 hover:scale-[1.01] active:scale-[0.99]"
              style={{ boxShadow: '0 0 20px oklch(0.7 0.25 300 / 0.2)' }}
            >
              <Swords className="h-4 w-4" />
              ENTER BATTLEFIELD
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
