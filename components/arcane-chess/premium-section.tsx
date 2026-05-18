"use client"

import { Button } from "@/components/ui/button"

export function PremiumSection() {
  return (
    <section className="py-20 px-4 relative bg-gradient-to-b from-[oklch(0.1_0.025_280)] to-[oklch(0.12_0.04_280)]">
      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-10 w-8 h-8 border-2 border-neon-gold/20 rotate-45 animate-float" />
      <div className="absolute top-1/3 right-16 w-4 h-4 bg-neon-purple/20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-6 h-6 border-2 border-neon-cyan/20 animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-xl mx-auto relative z-10">
        {/* Premium card */}
        <div className="relative bg-card border-2 border-neon-gold glow-gold p-8 md:p-12">
          {/* Corner decorations */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-neon-gold" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-gold" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-neon-gold" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-neon-gold" />
          
          {/* Crown icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-neon-gold/10 border-2 border-neon-gold">
              <PixelCrownIcon />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-xl md:text-2xl lg:text-3xl text-center text-neon-gold text-glow-gold mb-2">
            Magic Pass
          </h2>
          
          <p className="text-xs md:text-sm text-center text-muted-foreground mb-8">
            Unlock the full arcane experience
          </p>
          
          {/* Benefits list */}
          <div className="space-y-4 mb-8">
            <BenefitItem text="Custom piece skins & board themes" />
            <BenefitItem text="Exclusive spell modes" />
            <BenefitItem text="Advanced AI coach features" />
            <BenefitItem text="Profile cosmetics & badges" />
            <BenefitItem text="Priority matchmaking" />
          </div>
          
          {/* CTA Button */}
          <Button className="w-full py-6 bg-neon-gold hover:bg-neon-gold/80 text-accent-foreground text-xs md:text-sm pixel-border-gold glow-gold transition-all hover:scale-105">
            Upgrade Now
          </Button>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
        </div>
      </div>
    </section>
  )
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-neon-gold flex-shrink-0" />
      <span className="text-xs md:text-sm text-foreground/80">{text}</span>
    </div>
  )
}

function PixelCrownIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8 md:w-10 md:h-10 text-neon-gold" fill="currentColor">
      <rect x="4" y="24" width="24" height="4" />
      <rect x="4" y="12" width="4" height="12" />
      <rect x="24" y="12" width="4" height="12" />
      <rect x="14" y="8" width="4" height="16" />
      <rect x="4" y="8" width="4" height="4" />
      <rect x="24" y="8" width="4" height="4" />
      <rect x="14" y="4" width="4" height="4" />
      <rect x="8" y="16" width="4" height="8" />
      <rect x="20" y="16" width="4" height="8" />
    </svg>
  )
}
