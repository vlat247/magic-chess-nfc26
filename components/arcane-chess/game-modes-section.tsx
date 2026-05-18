"use client"

import { useState } from "react"

interface GameModeCardProps {
  icon: string
  title: string
  description: string
  color: "purple" | "cyan" | "gold" | "pink"
}

function GameModeCard({ icon, title, description, color }: GameModeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const colorClasses = {
    purple: {
      border: 'border-neon-purple',
      glow: 'glow-purple',
      text: 'text-neon-purple',
      bg: 'bg-neon-purple/10'
    },
    cyan: {
      border: 'border-neon-cyan',
      glow: 'glow-cyan',
      text: 'text-neon-cyan',
      bg: 'bg-neon-cyan/10'
    },
    gold: {
      border: 'border-neon-gold',
      glow: 'glow-gold',
      text: 'text-neon-gold',
      bg: 'bg-neon-gold/10'
    },
    pink: {
      border: 'border-neon-pink',
      glow: 'shadow-[0_0_20px_oklch(0.7_0.22_330_/_0.5)]',
      text: 'text-neon-pink',
      bg: 'bg-neon-pink/10'
    }
  }
  
  const styles = colorClasses[color]
  
  return (
    <div 
      className={`
        relative p-6 bg-card border-2 transition-all duration-300 cursor-pointer
        ${isHovered ? `${styles.border} ${styles.glow} transform scale-105` : 'border-border'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scanline effect on hover */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
          }}
        />
      )}
      
      {/* Icon container */}
      <div className={`
        w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-4
        ${styles.bg} border ${styles.border}
        ${isHovered ? 'animate-float' : ''}
      `}>
        <span className="text-2xl md:text-3xl">{icon}</span>
      </div>
      
      {/* Title */}
      <h3 className={`text-xs md:text-sm mb-2 ${styles.text}`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-[10px] md:text-xs text-muted-foreground">
        {description}
      </p>
      
      {/* Play indicator */}
      <div className={`
        absolute bottom-4 right-4 text-[8px] md:text-[10px] ${styles.text}
        opacity-0 transition-opacity duration-300
        ${isHovered ? 'opacity-100' : ''}
      `}>
        [ PLAY ]
      </div>
    </div>
  )
}

export function GameModesSection() {
  return (
    <section className="py-20 px-4 relative bg-[oklch(0.1_0.025_280)]">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-neon-purple animate-pulse-glow" />
      <div className="absolute top-20 right-20 w-2 h-2 bg-neon-cyan animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-neon-gold animate-pulse-glow" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section title */}
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl text-glow-cyan mb-4">
            <span className="text-neon-cyan">Game</span>
            <span className="text-foreground"> Modes</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Select your battlefield
          </p>
        </div>
        
        {/* Game mode cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GameModeCard
            icon="🐴"
            title="Knight Only"
            description="Battle with only knights. Pure tactical chaos."
            color="purple"
          />
          
          <GameModeCard
            icon="⚡"
            title="Chaos Mode"
            description="Random spells, random events, pure madness."
            color="cyan"
          />
          
          <GameModeCard
            icon="♟️"
            title="Classic Mode"
            description="Traditional chess with full rules and rankings."
            color="gold"
          />
          
          <GameModeCard
            icon="🔥"
            title="Boss AI Mode"
            description="Face the ultimate AI challenge. Can you win?"
            color="pink"
          />
        </div>
      </div>
    </section>
  )
}
