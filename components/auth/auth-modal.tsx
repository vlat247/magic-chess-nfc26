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
import { ChromeIcon, GithubIcon, Sparkles, User, AlertCircle, Wand2 } from 'lucide-react'
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
    <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-slate-950 p-1 text-slate-100 shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]">
      {/* Decorative magical aura background */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      <div className="px-6 py-8 relative z-10">
        <DialogHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/20 bg-purple-950/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)] animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
            Enter the Chess Sanctum
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm max-w-sm mx-auto">
            Choose your gateway to summon magic spells, track legendary wins, and climb the global ranks.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={() => handleProviderLogin('google')}
            disabled={isPending}
            variant="outline"
            className="w-full relative overflow-hidden border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:text-white transition-all duration-300 group flex items-center justify-center gap-3 py-6 rounded-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ChromeIcon className="h-5 w-5 text-slate-300 group-hover:text-purple-400 transition-colors" />
            <span className="font-semibold text-slate-200">Continue with Google</span>
          </Button>

          <Button
            onClick={() => handleProviderLogin('github')}
            disabled={isPending}
            variant="outline"
            className="w-full relative overflow-hidden border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:text-white transition-all duration-300 group flex items-center justify-center gap-3 py-6 rounded-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <GithubIcon className="h-5 w-5 text-slate-300 group-hover:text-purple-400 transition-colors" />
            <span className="font-semibold text-slate-200">Continue with GitHub</span>
          </Button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800/80" />
            </div>
            <span className="relative bg-slate-950 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Or summon a quick game
            </span>
          </div>

          <Button
            onClick={handleGuestLogin}
            disabled={isPending}
            variant="ghost"
            className="w-full border border-dashed border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-950/20 text-purple-300 hover:text-purple-200 transition-all duration-300 flex items-center justify-center gap-3 py-6 rounded-lg"
          >
            <User className="h-5 w-5" />
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold text-sm">Play as Guest</span>
              <span className="text-[10px] text-purple-400/80">Stats will not be saved permanently</span>
            </div>
            <Wand2 className="h-4 w-4 ml-auto opacity-60 group-hover:opacity-100 animate-pulse text-purple-400" />
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500">
            By entering the sanctum, you agree to unleash legendary chess magic.
          </p>
        </div>
      </div>
    </div>
  )

  if (isOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
        <DialogContent className="p-0 border-none max-w-md bg-transparent">
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
      <DialogContent className="p-0 border-none max-w-md bg-transparent">
        {content}
      </DialogContent>
    </Dialog>
  )
}
