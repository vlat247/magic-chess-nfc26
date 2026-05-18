"use client"

import { useState } from "react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  features: string[]
  glowColor: "purple" | "cyan" | "gold"
}

function FeatureCard({ icon, title, features, glowColor }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const glowClasses = {
    purple: 'glow-purple border-neon-purple',
    cyan: 'glow-cyan border-neon-cyan',
    gold: 'glow-gold border-neon-gold'
  }
  
  const textClasses = {
    purple: 'text-neon-purple text-glow-purple',
    cyan: 'text-neon-cyan text-glow-cyan',
    gold: 'text-neon-gold text-glow-gold'
  }
  
  return (
    <div 
      className={`
        relative p-6 bg-card border-2 transition-all duration-300
        ${isHovered ? glowClasses[glowColor] : 'border-border'}
        ${isHovered ? 'transform scale-105' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pixel corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-neon-purple" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-neon-purple" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-neon-purple" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-neon-purple" />
      
      {/* Icon */}
      <div className={`text-3xl md:text-4xl mb-4 ${textClasses[glowColor]} ${isHovered ? 'animate-float' : ''}`}>
        {icon}
      </div>
      
      {/* Title */}
      <h3 className={`text-sm md:text-base mb-4 ${textClasses[glowColor]}`}>
        {title}
      </h3>
      
      {/* Features list */}
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
            <span className={`w-1 h-1 ${glowColor === 'purple' ? 'bg-neon-purple' : glowColor === 'cyan' ? 'bg-neon-cyan' : 'bg-neon-gold'}`} />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 relative">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section title */}
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl text-glow-purple mb-4">
            <span className="text-neon-purple">Game</span>
            <span className="text-foreground"> Features</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Choose your path to victory
          </p>
        </div>
        
        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<PixelWizardIcon />}
            title="Spell Modes"
            features={[
              "Chaos chess rules",
              "Teleport pieces",
              "Random events"
            ]}
            glowColor="purple"
          />
          
          <FeatureCard
            icon={<PixelRobotIcon />}
            title="AI Coach"
            features={[
              "Game analysis",
              "Mistake detection",
              "Improvement tips"
            ]}
            glowColor="cyan"
          />
          
          <FeatureCard
            icon={<PixelSwordIcon />}
            title="Classic Chess"
            features={[
              "Full rule chess",
              "Stockfish AI opponent",
              "Ranked gameplay"
            ]}
            glowColor="gold"
          />
        </div>
      </div>
    </section>
  )
}

// Pixel art style icons
function PixelWizardIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8 md:w-10 md:h-10" fill="currentColor">
      <rect x="14" y="2" width="4" height="4" />
      <rect x="12" y="6" width="8" height="4" />
      <rect x="10" y="10" width="12" height="2" />
      <rect x="14" y="12" width="4" height="8" />
      <rect x="10" y="20" width="12" height="4" />
      <rect x="8" y="24" width="4" height="4" />
      <rect x="20" y="24" width="4" height="4" />
    </svg>
  )
}

function PixelRobotIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8 md:w-10 md:h-10" fill="currentColor">
      <rect x="14" y="2" width="4" height="4" />
      <rect x="8" y="6" width="16" height="12" />
      <rect x="10" y="8" width="4" height="4" />
      <rect x="18" y="8" width="4" height="4" />
      <rect x="12" y="14" width="8" height="2" />
      <rect x="10" y="18" width="12" height="8" />
      <rect x="8" y="26" width="4" height="4" />
      <rect x="20" y="26" width="4" height="4" />
    </svg>
  )
}

function PixelSwordIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8 md:w-10 md:h-10" fill="currentColor">
      <rect x="4" y="4" width="4" height="4" />
      <rect x="8" y="8" width="4" height="4" />
      <rect x="12" y="12" width="4" height="4" />
      <rect x="16" y="16" width="4" height="4" />
      <rect x="20" y="20" width="4" height="4" />
      <rect x="24" y="24" width="4" height="4" />
      <rect x="16" y="20" width="4" height="4" />
      <rect x="12" y="24" width="4" height="4" />
    </svg>
  )
}
