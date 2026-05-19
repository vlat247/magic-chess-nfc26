'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type FantasyTheme = 'cyan' | 'purple' | 'gold' | 'default'

interface FantasyPixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: FantasyTheme
  glowOnHover?: boolean
  shimmer?: boolean
  noPadding?: boolean
  title?: string
  children: React.ReactNode
}

const THEME_STYLES = {
  cyan: {
    border: 'border-white/[0.06] group-hover:border-white/20',
    titleText: 'text-zinc-200 group-hover:text-white',
    titleBg: 'border-white/[0.08] bg-zinc-950/80',
  },
  purple: {
    border: 'border-white/[0.06] group-hover:border-white/20',
    titleText: 'text-zinc-200 group-hover:text-white',
    titleBg: 'border-white/[0.08] bg-zinc-950/80',
  },
  gold: {
    border: 'border-white/[0.06] group-hover:border-white/20',
    titleText: 'text-amber-500/80 group-hover:text-amber-400',
    titleBg: 'border-amber-500/20 bg-zinc-950/80',
  },
  default: {
    border: 'border-white/[0.06] group-hover:border-white/20',
    titleText: 'text-zinc-400 group-hover:text-zinc-200',
    titleBg: 'border-white/[0.08] bg-zinc-950/80',
  },
}

export function FantasyPixelCard({
  theme = 'default',
  glowOnHover = false, // disabled neon glow completely
  shimmer = true,
  noPadding = false,
  title,
  children,
  className,
  ...props
}: FantasyPixelCardProps) {
  const styles = THEME_STYLES[theme]

  return (
    <div
      className={cn(
        'relative group w-full overflow-hidden rounded-xl border transition-all duration-300',
        styles.border,
        'bg-zinc-950/40 backdrop-blur-xl shadow-lg',
        className
      )}
      {...props}
    >
      {/* Subtle corner markers */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-hover:border-white/20 transition-colors z-20" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/10 group-hover:border-white/20 transition-colors z-20" />

      {/* Behind Glow Layer (Pulses softly on hover) - DISABLED / CLEAN */}
      {glowOnHover && (
        <div
          className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"
          style={{
            boxShadow: `0 0 25px rgba(255, 255, 255, 0.02)`,
            filter: 'blur(8px)',
          }}
        />
      )}

      {/* Interactive Metallic Shimmer Sheen on Hover */}
      {shimmer && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <style jsx global>{`
            @keyframes border-shimmer {
              0% { transform: translateX(-150%) skewX(-30deg); }
              50%, 100% { transform: translateX(250%) skewX(-30deg); }
            }
            .animate-border-shimmer {
              animation: border-shimmer 4s ease-in-out infinite;
            }
          `}</style>
          <div className="absolute inset-0 w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-y-1/2 animate-border-shimmer" />
        </div>
      )}

      {/* Clean Title Badge (top-left) */}
      {title && (
        <div className="absolute top-3.5 left-4.5 z-20 pointer-events-none select-none">
          <div
            className={cn(
              "px-3 py-1 rounded border text-[8px] font-mono tracking-widest uppercase font-bold",
              styles.titleText,
              styles.titleBg
            )}
          >
            {title}
          </div>
        </div>
      )}

      {/* Card Content Panel */}
      <div className={cn("relative z-10 w-full h-full text-foreground", noPadding ? "p-0" : "p-5 md:p-6", title && !noPadding && "pt-10")}>
        {children}
      </div>
    </div>
  )
}
