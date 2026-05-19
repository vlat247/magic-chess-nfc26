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
    borderClass: 'pixel-border-silver',
    titleText: 'text-[#BFC7D5] group-hover:text-white',
    titleBg: 'border-2 border-[#BFC7D5]/40 bg-zinc-950/95',
    cornerClass: 'bg-[#BFC7D5]/40 group-hover:bg-[#BFC7D5]/80',
  },
  purple: {
    borderClass: 'pixel-border-darkmetal',
    titleText: 'text-[#8D99AE] group-hover:text-white',
    titleBg: 'border-2 border-[#2D3748] bg-zinc-950/95',
    cornerClass: 'bg-[#2D3748] group-hover:bg-[#4A5568]',
  },
  gold: {
    borderClass: 'pixel-border-yellow',
    titleText: 'text-[#FACC15] group-hover:text-amber-300 text-glow-gold',
    titleBg: 'border-2 border-[#FACC15]/40 bg-zinc-950/95',
    cornerClass: 'bg-[#FACC15]/40 group-hover:bg-[#FACC15]/80',
  },
  default: {
    borderClass: 'pixel-border-steel',
    titleText: 'text-[#8D99AE] group-hover:text-[#BFC7D5]',
    titleBg: 'border-2 border-[#8D99AE]/40 bg-zinc-950/95',
    cornerClass: 'bg-[#8D99AE]/40 group-hover:bg-[#8D99AE]/80',
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
        'relative group w-full overflow-hidden rounded-none transition-all duration-300',
        styles.borderClass,
        'bg-zinc-950/60 backdrop-blur-xl',
        className
      )}
      {...props}
    >
      {/* Subtle corner pixel blocks */}
      <div className={cn("absolute top-1.5 left-1.5 w-1 h-1 transition-colors z-20", styles.cornerClass)} />
      <div className={cn("absolute top-1.5 right-1.5 w-1 h-1 transition-colors z-20", styles.cornerClass)} />
      <div className={cn("absolute bottom-1.5 left-1.5 w-1 h-1 transition-colors z-20", styles.cornerClass)} />
      <div className={cn("absolute bottom-1.5 right-1.5 w-1 h-1 transition-colors z-20", styles.cornerClass)} />

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
              "px-3 py-1 rounded-none text-[8px] font-mono tracking-widest uppercase font-bold",
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
