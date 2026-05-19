'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { AuthModal } from '@/components/auth/auth-modal'
import { logout } from '@/actions/auth'
import { Trophy, Swords, User, LogOut, ChevronDown, LayoutGrid, Store } from 'lucide-react'


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
          background: 'rgba(12, 15, 22, 0.5)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(141, 153, 174, 0.15)',
          boxShadow: '0 1px 0 0 rgba(141, 153, 174, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">

          {/* Logo — pixel chess piece only, no text */}
          <Link href="/" className="flex items-center select-none group" aria-label="Home">
            <div
              className="flex h-8 w-8 items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{
                background: '#2D3748',
                border: '1px solid #4A5568',
                color: '#FACC15',
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
            {[
              { href: '/profile',     label: 'Lobby',    Icon: LayoutGrid },
              { href: '/play',        label: 'Play',     Icon: Swords     },
              { href: '/leaderboard', label: 'Rankings', Icon: Trophy     },
              { href: '/premium',     label: 'Shop',     Icon: Store      },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase transition-colors duration-200 cursor-pointer"
                style={{ color: '#8D99AE' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FACC15')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8D99AE')}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-4 relative">
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 transition-all select-none cursor-pointer border border-[#4A5568]/45 hover:border-[#8D99AE]/60 bg-[#1E2530]/40 rounded-none shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000]"
                    >
                      <span className="font-mono text-[10px] font-bold text-zinc-100 uppercase tracking-wider">{username}</span>
                      <ChevronDown className="h-3 w-3 text-[#8D99AE] ml-0.5 shrink-0" />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                        <div
                          className="absolute right-0 mt-2 w-44 p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 border border-[#4A5568]"
                          style={{
                            background: '#1E2530',
                            boxShadow: '4px 4px 0px #000000',
                          }}
                        >
                          <div
                            className="px-3 py-2"
                            style={{ borderBottom: '1px solid #4A5568' }}
                          >
                            <p className="font-sans text-[9px]" style={{ color: '#8D99AE' }}>Summoner</p>
                            <p className="font-sans text-[10px] mt-0.5 truncate" style={{ color: '#BFC7D5' }}>{username}</p>
                          </div>

                          <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                            <button className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer text-[#8D99AE] hover:text-[#FACC15] transition-colors duration-200 group">
                              <User className="h-3.5 w-3.5 text-[#8D99AE] group-hover:text-[#FACC15] transition-colors duration-200" />
                              Profile
                            </button>
                          </Link>

                          <Link href="/play" onClick={() => setDropdownOpen(false)}>
                            <button className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer text-[#8D99AE] hover:text-[#FACC15] transition-colors duration-200 group">
                              <Swords className="h-3.5 w-3.5 text-[#8D99AE] group-hover:text-[#FACC15] transition-colors duration-200" />
                              Play
                            </button>
                          </Link>

                          <Link href="/leaderboard" onClick={() => setDropdownOpen(false)}>
                            <button className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer text-[#8D99AE] hover:text-[#FACC15] transition-colors duration-200 group">
                              <Trophy className="h-3.5 w-3.5 text-[#8D99AE] group-hover:text-[#FACC15] transition-colors duration-200" />
                              Rankings
                            </button>
                          </Link>

                          <Link href="/premium" onClick={() => setDropdownOpen(false)}>
                            <button className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer text-[#8D99AE] hover:text-[#FACC15] transition-colors duration-200 group">
                              <span className="text-xs shrink-0">👑</span>
                              Premium Vault
                            </button>
                          </Link>

                          <div className="border-t border-[#4A5568]" style={{ margin: '4px 0' }} />

                          <form action={logout}>
                            <button
                              type="submit"
                              onClick={() => setDropdownOpen(false)}
                              className="w-full flex items-center gap-2 px-3 py-2 font-sans text-[10px] text-left select-none cursor-pointer text-[#8D99AE] hover:text-[#EF4444] transition-colors duration-200 group"
                            >
                              <LogOut className="h-3.5 w-3.5 text-[#8D99AE] group-hover:text-[#EF4444] transition-colors duration-200" />
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
                    className="font-sans text-[10px] tracking-widest px-4 py-2 transition-all duration-200 active:scale-95 cursor-pointer bg-[#1E2530] hover:bg-[#2D3748] border border-[#4A5568] hover:border-[#FACC15] text-[#8D99AE] hover:text-[#FACC15] hover:shadow-[0_0_10px_rgba(250,204,21,0.2)] shadow-[2px_2px_0px_#000000] rounded-none uppercase"
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
