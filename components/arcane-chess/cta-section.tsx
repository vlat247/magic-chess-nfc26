"use client"

import { Button } from "@/components/ui/button"
import { MagicParticles } from "./magic-particles"

export function CTASection() {
  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Dark dramatic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.12_0.04_280)] via-[oklch(0.08_0.03_280)] to-[oklch(0.06_0.02_280)]" />
      
      {/* Pixel grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Particles */}
      <MagicParticles />
      
      {/* Decorative chess pieces silhouettes */}
      <div className="absolute left-5 md:left-20 top-1/2 -translate-y-1/2 opacity-10">
        <PixelKnightSilhouette />
      </div>
      <div className="absolute right-5 md:right-20 top-1/2 -translate-y-1/2 opacity-10 transform scale-x-[-1]">
        <PixelKnightSilhouette />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-12 md:w-20 h-0.5 bg-gradient-to-r from-transparent to-neon-purple" />
          <div className="w-2 h-2 bg-neon-purple rotate-45" />
          <div className="w-12 md:w-20 h-0.5 bg-gradient-to-l from-transparent to-neon-purple" />
        </div>
        
        {/* Main text */}
        <h2 className="text-xl md:text-3xl lg:text-4xl mb-4 text-glow-purple leading-relaxed">
          <span className="text-foreground">Ready to </span>
          <span className="text-neon-purple">break</span>
          <span className="text-foreground"> the</span>
          <br />
          <span className="text-neon-gold text-glow-gold">rules of chess</span>
          <span className="text-foreground">?</span>
        </h2>
        
        <p className="text-xs md:text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Join thousands of players in the most magical chess experience ever created.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="px-10 py-6 bg-neon-purple hover:bg-neon-purple/80 text-primary-foreground text-xs md:text-sm pixel-border glow-purple transition-all hover:scale-105"
          >
            Play Now
          </Button>
          <Button 
            variant="outline"
            className="px-10 py-6 bg-transparent border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 text-xs md:text-sm transition-all hover:scale-105 hover:text-white"
          >
            Join Community
          </Button>
        </div>
        
        {/* Stats */}
        <div className="flex justify-center gap-8 md:gap-16 mt-12">
          <div className="text-center">
            <div className="text-lg md:text-2xl text-neon-cyan text-glow-cyan">10K+</div>
            <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Players</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-2xl text-neon-purple text-glow-purple">1M+</div>
            <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Games</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-2xl text-neon-gold text-glow-gold">50+</div>
            <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Spells</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PixelKnightSilhouette() {
  return (
    <svg viewBox="0 0 64 64" className="w-20 h-20 md:w-32 md:h-32 text-neon-purple" fill="currentColor">
      <rect x="16" y="8" width="8" height="8" />
      <rect x="24" y="8" width="8" height="8" />
      <rect x="8" y="16" width="8" height="8" />
      <rect x="16" y="16" width="8" height="8" />
      <rect x="24" y="16" width="8" height="8" />
      <rect x="32" y="16" width="8" height="8" />
      <rect x="8" y="24" width="8" height="8" />
      <rect x="32" y="24" width="8" height="8" />
      <rect x="40" y="24" width="8" height="8" />
      <rect x="16" y="32" width="8" height="8" />
      <rect x="24" y="32" width="8" height="8" />
      <rect x="32" y="32" width="8" height="8" />
      <rect x="24" y="40" width="8" height="8" />
      <rect x="32" y="40" width="8" height="8" />
      <rect x="16" y="48" width="8" height="8" />
      <rect x="24" y="48" width="8" height="8" />
      <rect x="32" y="48" width="8" height="8" />
      <rect x="40" y="48" width="8" height="8" />
      <rect x="8" y="56" width="48" height="8" />
    </svg>
  )
}
