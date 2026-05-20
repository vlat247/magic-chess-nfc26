'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Sparkles, BookOpen, ChevronRight, X, Volume2, VolumeX } from 'lucide-react'

// Onboarding Steps Configuration
interface DialogueStep {
  text: string
  theme: 'purple' | 'cyan' | 'gold'
  speaker: string
  actionLabel?: string
}

const DIALOGUE_STEPS: DialogueStep[] = [
  {
    speaker: "Alistair, Arcane Guide",
    text: "Welcome, traveler... I am Alistair, keeper of the Arcane chessboard. I have watched many souls challenge these tiles, but few possess the spark of true magic.",
    theme: "purple"
  },
  {
    speaker: "Alistair, Arcane Guide",
    text: "This realm was built for those who seek more than ordinary chess. Here, strategy intertwines with magic. You can cast powerful spells to shift pieces, freeze enemies, or warp the battlefield itself.",
    theme: "cyan"
  },
  {
    speaker: "Alistair, Arcane Guide",
    text: "In Chaos Spell Mode, your Grimoire holds ancient incantations. Spend your mana wisely—each spell is a chess move that bends reality itself. Predict your enemy's magic, or fall to their traps.",
    theme: "purple"
  },
  {
    speaker: "Alistair, Arcane Guide",
    text: "Engage in matches against other mages or hone your spellcasting against our adaptive AI coach. Win duels to claim rating points, rise through the rankings, and earn powerful achievements.",
    theme: "purple"
  },
  {
    speaker: "Alistair, Arcane Guide",
    text: "As you gain XP and level up, you will unlock customization rewards. Board skins, customized piece cosmetics, and unique spell effects will showcase your mastery to all.",
    theme: "cyan"
  },
  {
    speaker: "Alistair, Arcane Guide",
    text: "Some knowledge remains sealed to ordinary wanderers... Entering the Premium Vault unlocks ancient piece cosmetics, advanced AI analysis, and the ultimate customization experience.",
    theme: "gold"
  },
  {
    speaker: "Alistair, Arcane Guide",
    text: "Go forth, summoner. Arrange your pieces, ready your mana, and let the spells clash! The chessboard awaits.",
    theme: "gold"
  }
]

// Synthesize retro 8-bit sound effects using Web Audio API
const playRetroSound = (type: 'blip' | 'click' | 'chime', volume: number = 0.01) => {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    
    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    if (type === 'blip') {
      // Subtle retro typewriter blip
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(140 + Math.random() * 40, ctx.currentTime)
      gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } else if (type === 'click') {
      // Satisfying click sound
      osc.type = 'square'
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08)
      gainNode.gain.setValueAtTime(volume * 0.8, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } else if (type === 'chime') {
      // Magical chime for premium/finish
      osc.type = 'sine'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(523.25, now) // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08) // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16) // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24) // C6
      
      gainNode.gain.setValueAtTime(volume, now)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
      osc.start()
      osc.stop(now + 0.6)
    }
  } catch (e) {
    // Audio synthesis fallback
    console.debug('Audio context not allowed or supported yet', e)
  }
}

export function OnboardingWizard() {
  const { user, isLoading } = useAuth()
  
  // Onboarding visible states
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  
  // Audio preferences
  const [soundEnabled, setSoundEnabled] = useState(false)
  
  // Text typing states
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentStep = DIALOGUE_STEPS[stepIndex]

  // Track if user has completed onboarding before
  useEffect(() => {
    if (isLoading || !user) return

    const isCompleted = localStorage.getItem(`arcane_chess_onboarding_completed_${user.id}`) === 'true'
    if (!isCompleted) {
      // Delay slightly for dramatic introduction (0.2 seconds)
      const timer = setTimeout(() => {
        setIsOpen(true)
        setStepIndex(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [user, isLoading])

  // Typing Effect Logic
  useEffect(() => {
    if (!isOpen) return

    setTypedText('')
    setIsTyping(true)
    let charIndex = 0
    const fullText = currentStep.text

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
    }

    typingTimerRef.current = setInterval(() => {
      if (charIndex < fullText.length) {
        const nextChar = fullText.charAt(charIndex)
        setTypedText((prev) => prev + nextChar)
        
        // Play subtle typewriter sound
        if (soundEnabled && charIndex % 2 === 0) {
          playRetroSound('blip', 0.015)
        }
        
        charIndex++
      } else {
        setIsTyping(false)
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current)
        }
      }
    }, 15) // Typing speed (15ms per char)

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current)
      }
    }
  }, [stepIndex, isOpen, soundEnabled, currentStep.text])

  // Skip / Finish onboarding
  const handleComplete = () => {
    if (soundEnabled) playRetroSound('chime', 0.03)
    if (user) {
      localStorage.setItem(`arcane_chess_onboarding_completed_${user.id}`, 'true')
    }
    setIsOpen(false)
  }

  const handleNext = () => {
    if (isTyping) {
      // Instantly reveal text if clicked while typing
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
      setTypedText(currentStep.text)
      setIsTyping(false)
      if (soundEnabled) playRetroSound('click', 0.01)
      return
    }

    if (stepIndex < DIALOGUE_STEPS.length - 1) {
      setStepIndex((prev) => prev + 1)
      if (soundEnabled) {
        // Special chime sound for premium mention
        if (stepIndex === 4) {
          playRetroSound('chime', 0.03)
        } else {
          playRetroSound('click', 0.02)
        }
      }
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    if (soundEnabled) playRetroSound('click', 0.02)
    handleComplete()
  }

  const handleSummon = () => {
    if (soundEnabled) playRetroSound('chime', 0.03)
    setStepIndex(0)
    setIsOpen(true)
  }

  // Handle keyboard hotkeys (Space / Enter to proceed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isTyping, stepIndex])

  // Don't render anything if auth state is loading or user is not logged in
  if (isLoading || !user) return null

  // Determine current wizard styling colors based on theme
  const getThemeColors = (theme: 'purple' | 'cyan' | 'gold') => {
    switch (theme) {
      case 'cyan':
        return {
          glow: 'glow-cyan border-neon-cyan/50 text-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.25)]',
          textGlow: 'text-glow-cyan text-neon-cyan',
          accent: 'bg-neon-cyan',
          border: 'border-neon-cyan/40',
          hoverGlow: 'hover:bg-neon-cyan/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]',
          particles: 'rgba(34, 211, 238, 0.4)'
        }
      case 'gold':
        return {
          glow: 'glow-gold border-neon-gold/50 text-neon-gold shadow-[0_0_25px_rgba(250,204,21,0.35)]',
          textGlow: 'text-glow-gold text-neon-gold',
          accent: 'bg-neon-gold',
          border: 'border-neon-gold/40',
          hoverGlow: 'hover:bg-neon-gold/10 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]',
          particles: 'rgba(250, 204, 21, 0.4)'
        }
      case 'purple':
      default:
        return {
          glow: 'glow-purple border-neon-purple/50 text-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.25)]',
          textGlow: 'text-glow-purple text-neon-purple',
          accent: 'bg-neon-purple',
          border: 'border-neon-purple/40',
          hoverGlow: 'hover:bg-neon-purple/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
          particles: 'rgba(168, 85, 247, 0.4)'
        }
    }
  }

  const colors = getThemeColors(currentStep.theme)

  return (
    <>
      {/* ── ACTIVE VISUAL NOVEL SCENE ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none select-none overflow-hidden">
            
            {/* Ambient Darkened Vignette Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/30 pointer-events-auto"
              onClick={handleNext}
            />

            {/* Glowing Ambient Particle Generator background */}
            <div className="absolute inset-0 pointer-events-none">
              <MagicSparkles theme={currentStep.theme} color={colors.particles} />
            </div>

            {/* Main Interactive Interface Row */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pb-4 md:pb-8 flex flex-col md:flex-row items-end justify-center pointer-events-none gap-4 md:gap-0">
              
              {/* ── WIZARD CHARACTER PORTRAIT (Floating, Left) ───────────────── */}
              <motion.div
                initial={{ opacity: 0, x: -100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="relative flex flex-col items-center justify-end w-36 h-36 md:w-64 md:h-64 self-start md:self-auto ml-4 md:ml-0 pointer-events-auto shrink-0 z-20"
              >
                {/* Floating motion wrap */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-full h-full flex items-center justify-center cursor-pointer group"
                  onClick={() => {
                    if (soundEnabled) playRetroSound('click', 0.02)
                  }}
                >
                  {/* Subtle magic portal halo backdrop */}
                  <div className={cn(
                    "absolute w-24 h-24 md:w-44 md:h-44 rounded-full bg-radial from-transparent to-transparent opacity-20 filter blur-xl transition-all duration-700 pointer-events-none scale-100 group-hover:scale-110",
                    currentStep.theme === 'cyan' && 'bg-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.3)]',
                    currentStep.theme === 'gold' && 'bg-amber-500/20 shadow-[0_0_60px_rgba(245,158,11,0.4)]',
                    currentStep.theme === 'purple' && 'bg-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.3)]'
                  )} />

                  {/* Character Illustration */}
                  <img
                    src="/wizard.png"
                    alt="Alistair the Wizard"
                    className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  />

                  {/* Wizard's soft ambient sparks */}
                  <span className="absolute bottom-4 left-4 text-glow-purple text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono">
                    ✦ summoner ✦
                  </span>
                </motion.div>
              </motion.div>

              {/* ── RPG VISUAL NOVEL DIALOGUE BOX ────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.1 }}
                className="relative w-full pointer-events-auto z-10"
              >
                {/* Dialogue Panel */}
                <div 
                  className={cn(
                    "relative w-full p-5 md:p-7 bg-zinc-950/90 border-2 rounded-none backdrop-blur-md cursor-pointer select-text",
                    colors.glow
                  )}
                  onClick={handleNext}
                >
                  {/* Subtle scanline overlay for CRT visual novel style */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.06] animate-scanlines mix-blend-overlay" />
                  
                  {/* Glowing corners ornament */}
                  <div className={cn("absolute top-1 left-1 w-1.5 h-1.5", colors.accent)} />
                  <div className={cn("absolute top-1 right-1 w-1.5 h-1.5", colors.accent)} />
                  <div className={cn("absolute bottom-1 left-1 w-1.5 h-1.5", colors.accent)} />
                  <div className={cn("absolute bottom-1 right-1 w-1.5 h-1.5", colors.accent)} />

                  {/* Dialogue Nameplate / Badge (top-left offset) */}
                  <div className="absolute -top-3.5 left-4 md:left-6 z-20 select-none pointer-events-none">
                    <div 
                      className={cn(
                        "px-3 py-1 border-2 font-title tracking-widest uppercase font-bold text-xs md:text-sm bg-zinc-950 shadow-[2px_2px_0px_#000000] flex items-center gap-1.5",
                        colors.border,
                        colors.textGlow
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      {currentStep.speaker}
                    </div>
                  </div>

                  {/* Audio Speaker Mute/Unmute toggle (top-right offset) */}
                  <div className="absolute -top-3 right-4 md:right-6 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSoundEnabled(!soundEnabled)
                        // Trigger synthetic chime if toggling on
                        if (!soundEnabled) {
                          setTimeout(() => playRetroSound('click', 0.02), 50)
                        }
                      }}
                      className={cn(
                        "p-1 border border-zinc-700 bg-zinc-950 text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000]",
                        soundEnabled && "border-neon-gold text-neon-gold text-glow-gold"
                      )}
                      title={soundEnabled ? "Mute retro sound" : "Enable retro text blips"}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      ) : (
                        <VolumeX className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Main Dialogue text container */}
                  <div className="mt-2 min-h-[4rem] md:min-h-[5rem]">
                    {/* Paragraph styling mapping */}
                    <p className="font-[family:var(--font-geist)] text-sm md:text-base text-zinc-100 leading-relaxed md:leading-loose select-text">
                      {typedText}
                      
                      {/* Blinking type cursor */}
                      {isTyping && (
                        <span className={cn("inline-block w-1.5 h-4 ml-1 align-middle animate-pulse-glow", colors.accent)} />
                      )}
                    </p>
                  </div>

                  {/* Blinking Proceed Indicator */}
                  {!isTyping && (
                    <div className="absolute bottom-3 right-4 select-none pointer-events-none">
                      <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className={cn("text-xs md:text-sm font-mono text-glow", colors.textGlow)}
                      >
                        ▼
                      </motion.div>
                    </div>
                  )}

                  {/* ── ACTION CONTROLS ───────────────────────────────────────── */}
                  <div 
                    className="mt-6 flex flex-row items-center justify-between border-t border-zinc-800/80 pt-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Step progress details */}
                    <div className="font-mono text-[8px] md:text-[9px] uppercase tracking-wider text-zinc-500 select-none">
                      Grimoire page {stepIndex + 1} / {DIALOGUE_STEPS.length}
                    </div>

                    {/* Button actions */}
                    <div className="flex items-center gap-3">
                      {/* Skip/Dismiss */}
                      {stepIndex < DIALOGUE_STEPS.length - 1 && (
                        <button
                          onClick={handleSkip}
                          className="px-3 py-1.5 border border-zinc-700 bg-zinc-950 text-zinc-500 hover:text-rose-400 hover:border-rose-455/50 font-mono text-[9px] uppercase tracking-widest cursor-pointer transition-all duration-200"
                        >
                          Skip
                        </button>
                      )}

                      {/* Next / Complete */}
                      <button
                        onClick={handleNext}
                        className={cn(
                          "px-4.5 py-1.5 border-2 bg-zinc-950 font-mono text-[9px] uppercase tracking-widest font-bold shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000] cursor-pointer transition-all duration-200 flex items-center gap-1",
                          colors.border,
                          colors.textGlow,
                          colors.hoverGlow
                        )}
                      >
                        <span>{stepIndex === DIALOGUE_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                        <ChevronRight className="w-3 h-3 shrink-0" />
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FLOATING SUMMON GUIDE BUTTON ─────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            className="fixed bottom-4 left-4 z-40"
          >
            {/* Guide Head Button */}
            <button
              onClick={handleSummon}
              className="group relative flex items-center justify-center w-12 h-12 bg-zinc-950 border-2 border-neon-purple hover:border-neon-gold rounded-none shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] transition-all duration-300 hover:scale-105 glow-purple hover:glow-gold cursor-pointer"
              title="Summon Arcane Guide"
            >
              {/* Ambient micro scanline inside button */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] animate-scanlines" />

              {/* Wizard face overlay / icon */}
              <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden">
                <img
                  src="/wizard.png"
                  alt="Guide Icon"
                  className="w-full h-full object-contain filter brightness-90 group-hover:brightness-110 group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Magical Sparkles behind button */}
              <span className="absolute -top-1 -right-1 text-neon-gold text-[8px] animate-pulse">✦</span>
              
              {/* Tooltip */}
              <div className="absolute bottom-14 left-0 scale-0 group-hover:scale-100 transition-all duration-200 origin-bottom-left pointer-events-none bg-zinc-950 border border-neon-purple/75 text-[8px] font-mono uppercase tracking-widest text-zinc-300 py-1.5 px-3 whitespace-nowrap shadow-[3px_3px_0px_rgba(0,0,0,0.9)]">
                Consult Guide
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── SUB-COMPONENT: PORTRAIT MAGIC PARTICLE SYSTEM ─────────────────────────
interface MagicSparklesProps {
  theme: 'purple' | 'cyan' | 'gold'
  color: string
}

function MagicSparkles({ theme, color }: MagicSparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle class definition
    class Spark {
      x: number = 0
      y: number = 0
      size: number = 0
      speedX: number = 0
      speedY: number = 0
      alpha: number = 0
      color: string = ''
      decay: number = 0

      constructor() {
        this.reset()
        // Start randomly positioned to fill screen initially
        this.y = Math.random() * height
      }

      reset() {
        // Spawn near the bottom/left (around dialogue box & portrait area)
        const isLeftSpawn = Math.random() < 0.4
        this.x = isLeftSpawn 
          ? Math.random() * 300 
          : Math.random() * width

        this.y = height + 10
        this.size = Math.random() * 2.5 + 0.8
        this.speedX = Math.random() * 0.8 - 0.4
        this.speedY = -(Math.random() * 1.5 + 0.5)
        this.alpha = Math.random() * 0.5 + 0.3
        this.decay = Math.random() * 0.008 + 0.002
        this.color = color
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.alpha -= this.decay

        if (this.alpha <= 0 || this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset()
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save()
        c.globalAlpha = this.alpha
        c.shadowBlur = this.size * 2
        c.shadowColor = this.color
        c.fillStyle = this.color
        
        // Draw retro squares for pixel aesthetic
        c.fillRect(this.x, this.y, this.size, this.size)
        c.restore()
      }
    }

    const sparkCount = 45
    const sparks: Spark[] = []
    for (let i = 0; i < sparkCount; i++) {
      sparks.push(new Spark())
    }

    const loop = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < sparkCount; i++) {
        sparks[i].update()
        sparks[i].draw(ctx)
      }
      animationId = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [theme, color])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" />
}
