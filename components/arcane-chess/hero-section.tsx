"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "@/components/auth/auth-modal"
import { Button } from "@/components/ui/button"
import { MagicParticles } from "./magic-particles"

export function HeroSection() {
  const router = useRouter()
  const { user } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handlePlayNow = () => {
    if (user) {
      router.push("/play")
    } else {
      setAuthModalOpen(true)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)]" />
      
      {/* Pixel grid overlay */}
      <div 
        className="absolute inset-0 opacity-10 animate-grid"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 animate-scanlines mix-blend-overlay z-0" />
      
      {/* Background Elements (Overshadowed) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        {/* Red Fire Cluster - Top Left */}
        <div className="absolute top-[1%] left-[1%] w-32 h-32 md:w-64 md:h-64">
          <img src="/red-fire.png" alt="" className="absolute inset-0 w-full h-full object-contain opacity-70 animate-pulse animate-float -rotate-12" />
          <img src="/red-fire.png" alt="" className="absolute top-[80%] -right-[40%] w-1/3 h-1/3 object-contain opacity-40 brightness-50 animate-pulse animate-float rotate-45" style={{ animationDelay: '0.3s' }} />
          <img src="/red-fire.png" alt="" className="absolute -bottom-[30%] left-[40%] w-1/4 h-1/4 object-contain opacity-30 brightness-50 animate-pulse animate-float rotate-12" style={{ animationDelay: '0.7s' }} />
        </div>
        
        {/* Blue Fire Cluster - Bottom Right */}
        <div className="absolute bottom-[2%] right-[2%] w-32 h-32 md:w-64 md:h-64">
          <img src="/blue-fire.png" alt="" className="absolute inset-0 w-full h-full object-contain opacity-70 animate-pulse rotate-12" style={{ animationDelay: '1s' }} />
          <img src="/blue-fire.png" alt="" className="absolute -top-[30%] -left-[30%] w-1/3 h-1/3 object-contain opacity-40 brightness-50 animate-pulse -rotate-12" style={{ animationDelay: '1.3s' }} />
          <img src="/blue-fire.png" alt="" className="absolute top-[70%] -left-[50%] w-1/4 h-1/4 object-contain opacity-30 brightness-50 animate-pulse -rotate-45" style={{ animationDelay: '1.7s' }} />
        </div>
        
        {/* Stars Cluster - Top Right */}
        <div className="absolute top-[5%] right-[2%] w-24 h-24 md:w-48 md:h-48">
          <img src="/stars.png" alt="" className="absolute inset-0 w-full h-full object-contain opacity-70 animate-float rotate-12" style={{ animationDelay: '0.5s' }} />
          <img src="/stars.png" alt="" className="absolute -bottom-[40%] -left-[40%] w-1/2 h-1/2 object-contain opacity-50 brightness-50 animate-float -rotate-12" style={{ animationDelay: '0.8s' }} />
          <img src="/stars.png" alt="" className="absolute top-[40%] -left-[60%] w-1/3 h-1/3 object-contain opacity-40 brightness-50 animate-float rotate-45" style={{ animationDelay: '1.2s' }} />
        </div>
        
        {/* Ice/Snowflake Cluster - Bottom Left */}
        <div className="absolute bottom-[5%] left-[2%] w-24 h-24 md:w-48 md:h-48">
          <img src="/ice.png" alt="" className="absolute inset-0 w-full h-full object-contain opacity-70 animate-float -rotate-12" style={{ animationDelay: '1.5s' }} />
          <img src="/ice.png" alt="" className="absolute -top-[40%] right-[20%] w-1/2 h-1/2 object-contain opacity-50 brightness-50 animate-float rotate-12" style={{ animationDelay: '1.8s' }} />
          <img src="/ice.png" alt="" className="absolute -top-[20%] -right-[50%] w-1/3 h-1/3 object-contain opacity-40 brightness-50 animate-float -rotate-45" style={{ animationDelay: '2.2s' }} />
        </div>
      </div>
 
      {/* Vignette effect from sides */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,5,25,0.95)_100%)] shadow-[inset_0_0_150px_rgba(0,0,0,1)] z-0" />
      
      {/* Floating chessboard */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-80 h-80 md:w-96 md:h-96 animate-float" style={{ animationDelay: '0.5s' }}>
          <PixelChessboard />
        </div>
      </div>
      
      {/* Magic particles */}
      <MagicParticles />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main title */}
        <h1 
          className="text-7xl md:text-8xl lg:text-9xl mb-6 text-glow-purple font-title"
        >
          <span className="text-neon-purple">Chess</span>
          <span className="text-foreground"> & </span>
          <span className="text-neon-gold">Magic</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-base md:text-lg lg:text-xl text-neon-cyan mb-5 text-glow-cyan">
          Chess. But spells break the rules.
        </p>
        
        {/* Description */}
        <p className="text-sm md:text-base text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          A fantasy chess platform with chaotic modes, AI coach, and competitive classic gameplay.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handlePlayNow}
            className="px-8 py-6 bg-neon-purple hover:bg-neon-purple/80 text-primary-foreground text-xs md:text-sm pixel-border glow-purple transition-all hover:scale-105 cursor-pointer"
          >
            Play Now
          </Button>
          <Button 
            variant="outline"
            className="px-8 py-6 bg-transparent border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 text-xs md:text-sm transition-all hover:scale-105 hover:text-white"
          >
            Explore Modes
          </Button>
        </div>
      </div>
      
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}

function PixelChessboard() {
  const squares = Array.from({ length: 64 }, (_, i) => {
    const row = Math.floor(i / 8)
    const col = i % 8
    const isLight = (row + col) % 2 === 0
    return (
      <div
        key={i}
        className={`aspect-square ${
          isLight 
            ? 'bg-[oklch(0.25_0.08_300)]' 
            : 'bg-[oklch(0.15_0.04_280)]'
        }`}
        style={{
          boxShadow: isLight 
            ? 'inset 0 0 10px oklch(0.7 0.25 300 / 0.2)' 
            : 'none'
        }}
      />
    )
  })
  
  return (
    <div 
      className="grid grid-cols-8 w-full h-full pixel-border transform rotate-12 perspective-1000"
      style={{
        transform: 'rotateX(60deg) rotateZ(45deg)',
        boxShadow: '0 20px 60px oklch(0.7 0.25 300 / 0.3)'
      }}
    >
      {squares}
    </div>
  )
}
