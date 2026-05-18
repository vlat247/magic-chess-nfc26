"use client"

import { useEffect, useRef } from "react"

export function MagicParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    interface Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      alpha: number
      pulse: number
    }
    
    const particles: Particle[] = []
    const colors = [
      'rgba(168, 85, 247, ', // Purple
      'rgba(34, 211, 238, ', // Cyan  
      'rgba(250, 204, 21, ', // Gold
    ]
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2
      })
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.pulse += 0.02
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        
        // Calculate pulsing alpha
        const pulsingAlpha = particle.alpha * (0.5 + 0.5 * Math.sin(particle.pulse))
        
        // Draw pixel-style particle
        ctx.fillStyle = particle.color + pulsingAlpha + ')'
        ctx.shadowColor = particle.color + '0.8)'
        ctx.shadowBlur = 10
        
        const size = particle.size * (1 + 0.2 * Math.sin(particle.pulse))
        const px = Math.floor(particle.x / 2) * 2
        const py = Math.floor(particle.y / 2) * 2
        const pSize = Math.ceil(size)
        
        // Randomly decide to draw a sparkle (cross) or a square based on size/pulse
        if (particle.size > 2) {
          // Draw cross
          ctx.fillRect(px, py - pSize, pSize, pSize * 3)
          ctx.fillRect(px - pSize, py, pSize * 3, pSize)
        } else {
          // Draw as a small square
          ctx.fillRect(px, py, pSize, pSize)
        }
      })
      
      requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
    />
  )
}
