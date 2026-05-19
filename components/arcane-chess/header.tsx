'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { AuthModal } from '@/components/auth/auth-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { logout } from '@/actions/auth'
import { Trophy, Swords, User, LogOut, ChevronDown } from 'lucide-react'

export function Header() {
  const { user, profile, isLoading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const rating = profile?.rating ?? 1200
  const username = profile?.username ?? 'Mage'

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3"
        style={{
          background: 'oklch(0.09 0.025 280 / 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid oklch(0.7 0.25 300 / 0.15)',
          boxShadow: '0 1px 0 0 oklch(0.7 0.25 300 / 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">

          {/* Logo — pixel chess piece only, no text */}
          <Link href="/" className="flex items-center select-none group" aria-label="Home">
            <div
              className="flex h-8 w-8 items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{
                background: 'oklch(0.14 0.05 300)',
                color: 'oklch(0.8 0.2 300)',
              }}
            >
              {/* Pixel crown/king chess piece SVG */}
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="12" width="10" height="2" fill="currentColor"/>
                <rect x="2" y="10" width="12" height="2" fill="currentColor"/>
                <rect x="3" y="8" width="10" height="2" fill="currentColor"/>
                <rect x="1" y="3" width="2" height="5" fill="currentColor"/>
                <rect x="7" y="1" width="2" height="5" fill="currentColor"/>
                <rect x="13" y="3" width="2" height="5" fill="currentColor"/>
                <rect x="3" y="6" width="4" height="2" fill="currentColor"/>
                <rect x="9" y="6" width="4" height="2" fill="currentColor"/>
              </svg>
            </div>
          </Link>

          {/* Navigation — absolutely centered */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/profile"
              className="font-sans text-[10px] tracking-widest transition-colors duration-200 cursor-pointer uppercase"
              style={{ color: 'oklch(0.6 0.05 280)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.85 0.05 280)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.6 0.05 280)')}
            >
              Lobby
            </Link>
            <Link
              href="/play"
              className="font-sans text-[10px] tracking-widest transition-colors duration-200 flex items-center gap-1 uppercase"
              style={{ color: 'oklch(0.6 0.05 280)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.85 0.18 300)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.6 0.05 280)')}
            >
              <Swords className="h-3 w-3" style={{ color: 'oklch(0.65 0.2 300)' }} />
              Play
            </Link>
            <Link
              href="/leaderboard"
              className="font-sans text-[10px] tracking-widest transition-colors duration-200 flex items-center gap-1 uppercase"
              style={{ color: 'oklch(0.6 0.05 280)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.7 0.2 195)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.6 0.05 280)')}
            >
              <Trophy className="h-3 w-3" style={{ color: 'oklch(0.7 0.2 195)' }} />
              Rankings
            </Link>
            <Link
              href="/premium"
              className="font-sans text-[10px] tracking-widest transition-all duration-200 flex items-center gap-1.5 uppercase font-bold text-glow-gold"
              style={{ color: 'oklch(0.8 0.18 85)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'oklch(0.9 0.22 85)'
                e.currentTarget.style.textShadow = '0 0 8px oklch(0.8 0.18 85)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'oklch(0.8 0.18 85)'
                e.currentTarget.style.textShadow = 'none'
              }}
            >
              <span className="text-[9px] select-none animate-pulse">👑</span>
              Shop
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-4 relative">
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-1.5 transition-all select-none cursor-pointer"
                      style={{
                        border: '1px solid oklch(0.3 0.06 280)',
                        background: 'oklch(0.13 0.04 280)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'oklch(0.7 0.25 300 / 0.5)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'oklch(0.3 0.06 280)'
                      }}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                        <AvatarFallback
                          className="text-xs font-sans"
                          style={{ background: 'oklch(0.18 0.06 300)', color: 'oklch(0.8 0.2 300)' }}
                        >
                          {username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start leading-none text-left">
                        <span className="font-sans text-[10px]" style={{ color: 'oklch(0.85 0.05 280)' }}>{username}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-sans text-[9px] flex items-center gap-0.5 text-neon-gold">
                            <Trophy className="h-2.5 w-2.5" />
                            {rating}
                          </span>
                          <span className="font-mono text-[7px] bg-zinc-950 border border-muted-foreground/30 px-1 py-0.5 rounded-full text-foreground/80 leading-none">
                            LVL {profile?.level ?? 1}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="h-3 w-3" style={{ color: 'oklch(0.5 0.05 280)' }} />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                        <div
                          className="absolute right-0 mt-2 w-44 p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                          style={{
                            background: 'oklch(0.11 0.03 280)',
                            boxShadow: '0 0 0 1px oklch(0.7 0.25 300 / 0.3), 0 12px 40px oklch(0.7 0.25 300 / 0.15)',
                          }}
                        >
                          <div
                            className="px-3 py-2"
                            style={{ borderBottom: '1px solid oklch(0.2 0.04 280)' }}
                          >
                            <p className="font-sans text-[9px]" style={{ color: 'oklch(0.5 0.05 280)' }}>Summoner</p>
                            <p className="font-sans text-[10px] mt-0.5 truncate" style={{ color: 'oklch(0.85 0.05 280)' }}>{username}</p>
                          </div>

                          <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer transition-colors"
                              style={{ color: 'oklch(0.7 0.05 280)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.9 0.2 300)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.7 0.05 280)')}
                            >
                              <User className="h-3.5 w-3.5" style={{ color: 'oklch(0.65 0.2 300)' }} />
                              Profile
                            </button>
                          </Link>

                          <Link href="/play" onClick={() => setDropdownOpen(false)}>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer transition-colors"
                              style={{ color: 'oklch(0.7 0.05 280)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.9 0.2 300)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.7 0.05 280)')}
                            >
                              <Swords className="h-3.5 w-3.5" style={{ color: 'oklch(0.65 0.2 300)' }} />
                              Play
                            </button>
                          </Link>

                          <Link href="/leaderboard" onClick={() => setDropdownOpen(false)}>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer transition-colors"
                              style={{ color: 'oklch(0.7 0.05 280)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.7 0.2 195)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.7 0.05 280)')}
                            >
                              <Trophy className="h-3.5 w-3.5" style={{ color: 'oklch(0.7 0.2 195)' }} />
                              Rankings
                            </button>
                          </Link>

                          <Link href="/premium" onClick={() => setDropdownOpen(false)}>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer transition-colors"
                              style={{ color: 'oklch(0.8 0.18 85)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.9 0.22 85)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.8 0.18 85)')}
                            >
                              <span className="text-xs">👑</span>
                              Premium Vault
                            </button>
                          </Link>

                          <div style={{ borderTop: '1px solid oklch(0.2 0.04 280)', margin: '4px 0' }} />

                          <form action={logout}>
                            <button
                              type="submit"
                              onClick={() => setDropdownOpen(false)}
                              className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer transition-colors"
                              style={{ color: 'oklch(0.65 0.18 20)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.75 0.2 20)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.65 0.18 20)')}
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              Sign out
                            </button>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="font-sans text-[10px] tracking-widest px-4 py-2 transition-all duration-200 active:scale-95 cursor-pointer"
                    style={{
                      background: 'oklch(0.14 0.05 300)',
                      boxShadow: '0 0 0 1px oklch(0.7 0.25 300 / 0.5)',
                      color: 'oklch(0.8 0.2 300)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.background = 'oklch(0.18 0.07 300)'
                      el.style.boxShadow = '0 0 0 1px oklch(0.7 0.25 300), 0 0 20px oklch(0.7 0.25 300 / 0.3)'
                      el.style.color = 'oklch(0.95 0.15 300)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.background = 'oklch(0.14 0.05 300)'
                      el.style.boxShadow = '0 0 0 1px oklch(0.7 0.25 300 / 0.5)'
                      el.style.color = 'oklch(0.8 0.2 300)'
                    }}
                  >
                    SIGN IN
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
