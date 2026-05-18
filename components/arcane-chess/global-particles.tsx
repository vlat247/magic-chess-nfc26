"use client"

import { useEffect, useRef } from "react"

export function GlobalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

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

    // Subtle colors — lower alpha ceiling so they stay in the bg
    const colors = [
      "rgba(168, 85, 247, ",  // purple
      "rgba(34, 211, 238, ",  // cyan
      "rgba(250, 204, 21, ",  // gold
      "rgba(219, 112, 246, ", // pink-purple
    ]

    const particles: Particle[] = []

    // Fewer particles, very slow, very transparent
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.18 + 0.04, // max ~0.22 — very subtle
        pulse: Math.random() * Math.PI * 2,
      })
    }

    let animId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY
        p.pulse += 0.015

        // Wrap
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse))
        ctx.fillStyle = p.color + a + ")"
        ctx.shadowColor = p.color + "0.6)"
        ctx.shadowBlur = 6

        const s = Math.ceil(p.size * (1 + 0.15 * Math.sin(p.pulse)))
        const px = Math.floor(p.x / 2) * 2
        const py = Math.floor(p.y / 2) * 2

        // Pixel cross for bigger, square for smaller
        if (p.size > 1.8) {
          ctx.fillRect(px, py - s, s, s * 3)
          ctx.fillRect(px - s, py, s * 3, s)
        } else {
          ctx.fillRect(px, py, s, s)
        }
      })

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  )
}
