"use client"

import { useEffect, useRef } from "react"

const COLORS = [
  "rgba(168, 85, 247, ",  // purple
  "rgba(34, 211, 238, ",  // cyan
  "rgba(250, 204, 21, ",  // gold
  "rgba(219, 112, 246, ", // pink
]

interface AmbientParticle {
  x: number; y: number
  size: number; speedX: number; speedY: number
  color: string; alpha: number; pulse: number
}

interface TrailParticle {
  x: number; y: number
  size: number; speedX: number; speedY: number
  color: string; alpha: number
  life: number; maxLife: number
}

export function GlobalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Size canvas to viewport (fixed position)
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // ── Ambient particles ─────────────────────────────────────
    const ambient: AmbientParticle[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.18 + 0.04,
      pulse: Math.random() * Math.PI * 2,
    }))

    // ── Cursor trail ──────────────────────────────────────────
    const trail: TrailParticle[] = []
    let lastSpawn = 0

    const spawnTrail = (mx: number, my: number) => {
      const now = Date.now()
      if (now - lastSpawn < 25) return  // throttle: spawn every 25ms
      lastSpawn = now

      const count = 3
      for (let i = 0; i < count; i++) {
        const maxLife = 45 + Math.random() * 35
        trail.push({
          x: mx + (Math.random() - 0.5) * 10,
          y: my + (Math.random() - 0.5) * 10,
          size: Math.random() * 3 + 1.5,
          speedX: (Math.random() - 0.5) * 1.5,
          speedY: (Math.random() - 0.5) * 1.5 - 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 0.75 + Math.random() * 0.25,
          life: maxLife,
          maxLife,
        })
      }
    }

    const onMouseMove = (e: MouseEvent) => spawnTrail(e.clientX, e.clientY)
    window.addEventListener("mousemove", onMouseMove)

    // ── Render loop ────────────────────────────────────────────
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Ambient
      for (const p of ambient) {
        p.x += p.speedX; p.y += p.speedY; p.pulse += 0.015
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse))
        const s = Math.ceil(p.size * (1 + 0.15 * Math.sin(p.pulse)))
        const px = Math.floor(p.x / 2) * 2
        const py = Math.floor(p.y / 2) * 2

        ctx.shadowBlur = 5
        ctx.shadowColor = p.color + "0.4)"
        ctx.fillStyle = p.color + a + ")"
        if (p.size > 1.8) {
          ctx.fillRect(px, py - s, s, s * 3)
          ctx.fillRect(px - s, py, s * 3, s)
        } else {
          ctx.fillRect(px, py, s, s)
        }
      }

      // Trail (iterate backwards to safely splice)
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]
        p.x += p.speedX
        p.y += p.speedY
        p.speedX *= 0.95
        p.speedY *= 0.95
        p.life--

        if (p.life <= 0) { trail.splice(i, 1); continue }

        const progress = p.life / p.maxLife
        const a = p.alpha * progress
        const s = Math.max(1, Math.ceil(p.size * progress))
        const px = Math.floor(p.x / 2) * 2
        const py = Math.floor(p.y / 2) * 2

        ctx.shadowBlur = 10
        ctx.shadowColor = p.color + a + ")"
        ctx.fillStyle = p.color + a + ")"

        // Pixel cross shape
        ctx.fillRect(px, py - s, s, s * 3)
        ctx.fillRect(px - s, py, s * 3, s)
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  )
}
