'use client'

import React, { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChromeIcon, GithubIcon, Sparkles, User, AlertCircle, Wand2, Zap } from 'lucide-react'
import { loginWithProvider, loginAsGuest } from '@/actions/auth'
import { cn } from '@/lib/utils'

interface AuthModalProps {
  trigger?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export function AuthModal({ trigger, isOpen, onClose }: AuthModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleProviderLogin = (provider: 'google' | 'github') => {
    setError(null)
    startTransition(async () => {
      try {
        await loginWithProvider(provider)
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication')
      }
    })
  }

  const handleGuestLogin = () => {
    setError(null)
    startTransition(async () => {
      try {
        await loginAsGuest()
        if (onClose) onClose()
      } catch (err: any) {
        setError(err.message || 'An error occurred during guest authentication')
      }
    })
  }

  const content = (
    <div
      className="relative overflow-hidden text-foreground"
      style={{
        background: 'oklch(0.09 0.03 280)',
        boxShadow: `
          0 0 0 2px oklch(0.7 0.25 300),
          0 0 0 4px oklch(0.09 0.03 280),
          0 0 60px oklch(0.7 0.25 300 / 0.25),
          0 0 120px oklch(0.7 0.25 300 / 0.1),
          inset 0 0 0 1px oklch(0.25 0.08 280)
        `,
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3) 51%)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* Pixel grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] animate-grid pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.7 0.25 300 / 0.4) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.7 0.25 300 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 pointer-events-none z-20"
        style={{ boxShadow: '2px 2px 0 0 oklch(0.7 0.25 300)' }} />
      <div className="absolute top-0 right-0 w-4 h-4 pointer-events-none z-20"
        style={{ boxShadow: '-2px 2px 0 0 oklch(0.7 0.25 300)' }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none z-20"
        style={{ boxShadow: '2px -2px 0 0 oklch(0.7 0.25 300)' }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none z-20"
        style={{ boxShadow: '-2px -2px 0 0 oklch(0.7 0.25 300)' }} />

      {/* Purple aura blob top-right */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'oklch(0.7 0.25 300 / 0.08)', filter: 'blur(60px)' }}
      />
      {/* Cyan aura blob bottom-left */}
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'oklch(0.7 0.2 195 / 0.08)', filter: 'blur(60px)' }}
      />

      {/* Main content */}
      <div className="relative z-10 px-6 pt-8 pb-7">
        <DialogHeader className="space-y-4 text-left">
          {/* Icon badge */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center animate-pulse-glow shrink-0"
              style={{
                background: 'oklch(0.15 0.05 300)',
                boxShadow: '0 0 0 2px oklch(0.7 0.25 300), 0 0 15px oklch(0.7 0.25 300 / 0.4)',
                color: 'oklch(0.85 0.2 300)',
              }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div
              className="h-px flex-1 opacity-60"
              style={{ background: 'linear-gradient(to right, oklch(0.7 0.25 300 / 0.6), transparent)' }}
            />
          </div>

          <DialogTitle
            className="font-sans text-xl leading-tight"
            style={{ color: 'oklch(0.85 0.2 300)', textShadow: '0 0 12px oklch(0.7 0.25 300 / 0.6)' }}
          >
            Enter the Chess Sanctum
          </DialogTitle>

          <DialogDescription
            className="font-sans text-xs leading-relaxed"
            style={{ color: 'oklch(0.65 0.05 280)' }}
          >
            Choose your gateway to summon magic spells, track legendary wins, and climb the global ranks.
          </DialogDescription>
        </DialogHeader>

        {/* Error state */}
        {error && (
          <div
            className="mt-4 flex items-center gap-2 p-3 text-xs animate-in fade-in slide-in-from-top-1 font-sans"
            style={{
              background: 'oklch(0.15 0.08 20)',
              boxShadow: '0 0 0 1px oklch(0.5 0.2 20), inset 0 0 0 1px oklch(0.3 0.1 20)',
              color: 'oklch(0.75 0.18 20)',
            }}
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth buttons */}
        <div className="mt-6 flex flex-col gap-3">
          {/* Google button */}
          <button
            onClick={() => handleProviderLogin('google')}
            disabled={isPending}
            className="group relative w-full overflow-hidden font-sans text-xs py-4 px-5 flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'oklch(0.13 0.04 280)',
              boxShadow: '0 0 0 1px oklch(0.35 0.08 280), inset 0 0 0 1px oklch(0.2 0.05 280)',
              color: 'oklch(0.85 0.05 280)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'oklch(0.16 0.06 300)'
              el.style.boxShadow = '0 0 0 1px oklch(0.7 0.25 300 / 0.7), 0 0 20px oklch(0.7 0.25 300 / 0.15), inset 0 0 0 1px oklch(0.25 0.08 300)'
              el.style.color = 'oklch(0.9 0.15 300)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'oklch(0.13 0.04 280)'
              el.style.boxShadow = '0 0 0 1px oklch(0.35 0.08 280), inset 0 0 0 1px oklch(0.2 0.05 280)'
              el.style.color = 'oklch(0.85 0.05 280)'
            }}
          >
            <ChromeIcon className="h-4 w-4 shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* GitHub button */}
          <button
            onClick={() => handleProviderLogin('github')}
            disabled={isPending}
            className="group relative w-full overflow-hidden font-sans text-xs py-4 px-5 flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'oklch(0.13 0.04 280)',
              boxShadow: '0 0 0 1px oklch(0.35 0.08 280), inset 0 0 0 1px oklch(0.2 0.05 280)',
              color: 'oklch(0.85 0.05 280)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'oklch(0.16 0.06 300)'
              el.style.boxShadow = '0 0 0 1px oklch(0.7 0.25 300 / 0.7), 0 0 20px oklch(0.7 0.25 300 / 0.15), inset 0 0 0 1px oklch(0.25 0.08 300)'
              el.style.color = 'oklch(0.9 0.15 300)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'oklch(0.13 0.04 280)'
              el.style.boxShadow = '0 0 0 1px oklch(0.35 0.08 280), inset 0 0 0 1px oklch(0.2 0.05 280)'
              el.style.color = 'oklch(0.85 0.05 280)'
            }}
          >
            <GithubIcon className="h-4 w-4 shrink-0" />
            <span>Continue with GitHub</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div
              className="absolute inset-0 flex items-center"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <span
                className="w-full"
                style={{
                  borderTop: '1px solid oklch(0.25 0.06 280)',
                  display: 'block',
                }}
              />
            </div>
            <span
              className="relative px-3 font-sans text-[9px] tracking-widest uppercase"
              style={{
                background: 'oklch(0.09 0.03 280)',
                color: 'oklch(0.45 0.1 300)',
                textShadow: '0 0 8px oklch(0.7 0.25 300 / 0.3)',
              }}
            >
              ✦ or summon a quick game ✦
            </span>
          </div>

          {/* Guest button */}
          <button
            onClick={handleGuestLogin}
            disabled={isPending}
            className="group relative w-full overflow-hidden font-sans text-xs py-4 px-5 flex items-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'oklch(0.11 0.04 300 / 0.5)',
              boxShadow: '0 0 0 1px oklch(0.5 0.18 300 / 0.4)',
              borderStyle: 'dashed',
              color: 'oklch(0.75 0.18 300)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'oklch(0.14 0.06 300 / 0.6)'
              el.style.boxShadow = '0 0 0 1px oklch(0.7 0.25 300 / 0.7), 0 0 20px oklch(0.7 0.25 300 / 0.15)'
              el.style.color = 'oklch(0.9 0.2 300)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'oklch(0.11 0.04 300 / 0.5)'
              el.style.boxShadow = '0 0 0 1px oklch(0.5 0.18 300 / 0.4)'
              el.style.color = 'oklch(0.75 0.18 300)'
            }}
          >
            <User className="h-4 w-4 shrink-0 opacity-80" />
            <div className="flex flex-col items-start text-left gap-0.5">
              <span className="font-sans text-xs">Play as Guest</span>
              <span
                className="font-sans text-[9px]"
                style={{ color: 'oklch(0.6 0.15 300)' }}
              >
                Stats will not be saved permanently
              </span>
            </div>
            <Wand2
              className="h-3.5 w-3.5 ml-auto animate-pulse-glow shrink-0"
              style={{ color: 'oklch(0.7 0.2 300)' }}
            />
          </button>
        </div>

        {/* Footer disclaimer */}
        <div className="mt-5 text-center">
          <p
            className="font-sans text-[8px] leading-relaxed"
            style={{ color: 'oklch(0.4 0.06 280)' }}
          >
            By entering the sanctum, you agree to unleash legendary chess magic.
          </p>
        </div>
      </div>
    </div>
  )

  if (isOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
        <DialogContent className="p-0 border-none max-w-md bg-transparent shadow-none">
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Sign In</Button>}
      </DialogTrigger>
      <DialogContent className="p-0 border-none max-w-md bg-transparent shadow-none">
        {content}
      </DialogContent>
    </Dialog>
  )
}
