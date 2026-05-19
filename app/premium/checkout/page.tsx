'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/arcane-chess/header'
import { Footer } from '@/components/arcane-chess/footer'
import { GlobalParticles } from '@/components/arcane-chess/global-particles'
import { upgradeToPro } from '@/actions/subscription'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, ShieldCheck, Sparkles, Terminal, Wand2 } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Local checkout inputs
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  
  // Process states
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details')
  const [error, setError] = useState<string | null>(null)

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '))
    } else {
      setCardNumber(v)
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9]/g, '')
    if (v.length >= 2) {
      v = v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    setCardExpiry(v.substring(0, 5))
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvv(e.target.value.replace(/[^0-9]/g, '').substring(0, 3))
  }

  const onSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!cardName.trim() || cardNumber.length < 15 || cardExpiry.length < 5 || cardCvv.length < 3) {
      setError('Please validate your credit parameters before summoning the upgrade.')
      return
    }

    setStep('processing')

    // Simulate 3 seconds of magical portal processing, then call server action
    setTimeout(() => {
      startTransition(async () => {
        try {
          await upgradeToPro()
          setStep('success')
          
          // Re-route to profile after 3.5 seconds of success screen
          setTimeout(() => {
            router.push('/profile')
          }, 3500)
        } catch (err: any) {
          setError(err.message || 'Transmutation failed.')
          setStep('details')
        }
      })
    }, 2800)
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[oklch(0.08_0.02_280)] via-[oklch(0.12_0.04_280)] to-[oklch(0.15_0.06_300)] overflow-x-hidden pt-28 pb-16 px-4">
      <Header />
      <GlobalParticles />

      {/* Atmospheric filters */}
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-scanlines mix-blend-overlay z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,5,25,0.9)_100%)] z-0" />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: TRANSACTION DETAILS */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="border-2 border-neon-gold glow-gold p-6 sm:p-8 bg-[oklch(0.1_0.03_280)] relative"
            >
              {/* Retro corners */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-neon-gold" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-gold" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-gold" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-neon-gold" />

              <div className="flex flex-col items-center gap-1.5 mb-6 text-center border-b border-[oklch(0.2_0.04_280)] pb-4">
                <Wand2 className="h-6 w-6 text-neon-gold animate-pulse" />
                <h1 className="font-title text-2xl text-neon-gold text-glow-gold uppercase mt-1">PRO TRANSACTION PORTAL</h1>
                <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">Upgrade Cost: $9.99 / Month</p>
              </div>

              {error && (
                <div className="mb-4 p-3 border border-red-500/40 bg-red-950/20 font-mono text-[9px] text-red-400 flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={onSubmitTransaction} className="flex flex-col gap-4">
                {/* Cardholder Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase">SUMMONER NAME ON CARD</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="ARCHMAGE INITIATE"
                    className="p-3 bg-[oklch(0.08_0.02_280)] border border-[oklch(0.25_0.05_280)] font-mono text-[10px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold transition-colors"
                  />
                </div>

                {/* Card Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase">CARD SECURE SEQUENCE (16-DIGIT)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      className="w-full p-3 pl-9 bg-[oklch(0.08_0.02_280)] border border-[oklch(0.25_0.05_280)] font-mono text-[10px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold transition-colors"
                    />
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase">EXPIRY DATE</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="p-3 bg-[oklch(0.08_0.02_280)] border border-[oklch(0.25_0.05_280)] font-mono text-[10px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold transition-colors text-center"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase">CVV KEY</label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={handleCvvChange}
                      placeholder="***"
                      className="p-3 bg-[oklch(0.08_0.02_280)] border border-[oklch(0.25_0.05_280)] font-mono text-[10px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold transition-colors text-center"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2.5 mt-2 border border-neon-cyan/20 bg-neon-cyan/5 p-3 font-mono text-[8px] leading-relaxed text-neon-cyan select-none">
                  <ShieldCheck className="h-4 w-4 shrink-0 animate-pulse-glow" />
                  <span>TRANSACTION INTEGRITY ASSURED. 256-BIT CRYPTOGRAPHIC CIPHERS ARE SECURING THIS RITUAL CONJUNCTION.</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 py-4 bg-neon-gold hover:bg-neon-gold/90 text-background font-sans font-bold text-[10px] tracking-widest pixel-border-gold glow-gold cursor-pointer active:scale-95 transition-all uppercase disabled:opacity-50"
                >
                  UPGRADE SUMMONING PROTOCOL
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: PROCESSING (PORTAL ACTIVATION) */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="border-2 border-neon-purple glow-purple p-12 bg-[oklch(0.09_0.02_280)] flex flex-col items-center justify-center text-center relative"
            >
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-neon-purple" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-purple" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-purple" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-neon-purple" />

              {/* Glowing Conjuring Portal Circle */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-t-neon-purple border-r-neon-cyan border-b-transparent border-l-transparent animate-spin shadow-[0_0_20px_oklch(0.7_0.25_300/0.4)]" style={{ animationDuration: '0.8s' }} />
                <div className="absolute w-20 h-20 rounded-full border-4 border-b-neon-purple border-l-neon-cyan border-t-transparent border-r-transparent animate-spin animate-reverse shadow-[0_0_20px_oklch(0.7_0.2_195/0.4)]" style={{ animationDuration: '1.2s' }} />
                <Wand2 className="h-8 w-8 text-neon-purple animate-pulse" />
              </div>

              <h2 className="font-title text-xl text-neon-purple text-glow-purple uppercase tracking-wide">
                SUMMONING THE CODES
              </h2>
              
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-2 max-w-xs leading-relaxed animate-pulse">
                CHANNELING GOLDEN VAULT ACCESS AND BINDING CUSTOM BOARD THEMES...
              </p>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS (CONGRATULATIONS & CONFETTI) */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-2 border-neon-gold glow-gold p-10 bg-[oklch(0.09_0.025_280)] flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-neon-gold" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-gold" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-neon-gold" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-neon-gold" />

              {/* Framer motion particles */}
              {[...Array(20)].map((_, i) => {
                const angle = Math.random() * Math.PI * 2
                const radius = 60 + Math.random() * 80
                const delay = Math.random() * 0.3
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1.5 }}
                    animate={{
                      x: Math.cos(angle) * radius,
                      y: Math.sin(angle) * radius,
                      opacity: 0,
                      scale: 0.2
                    }}
                    transition={{ duration: 1.2, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
                    className={`absolute w-2 h-2 ${i % 3 === 0 ? 'bg-neon-gold' : i % 3 === 1 ? 'bg-neon-purple' : 'bg-neon-cyan'}`}
                  />
                )
              })}

              <div className="w-16 h-16 rounded-full border-2 border-neon-gold bg-neon-gold/10 flex items-center justify-center mb-6 glow-gold animate-bounce">
                <Sparkles className="h-7 w-7 text-neon-gold" />
              </div>

              <h2 className="font-title text-2xl text-neon-gold text-glow-gold uppercase tracking-wider">
                TRANSMUTATION ACCOMPLISHED!
              </h2>

              <span className="font-mono text-[9px] text-neon-cyan tracking-widest uppercase block mt-2">
                LEVEL UP +500 XP AWARDED
              </span>

              <p className="font-mono text-[9px] text-muted-foreground uppercase mt-4 max-w-xs leading-relaxed border-t border-[oklch(0.2_0.04_280)] pt-4">
                WELCOME, PRO ARCHMAGE. ALL CUSTOM SKINS, Spell VFX AND PODIUMS ARE UNLOCKED. RETURNING TO Profile TAB...
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      <Footer />
    </main>
  )
}
