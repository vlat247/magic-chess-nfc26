'use client'

import { useState } from 'react'
import { Copy, Check, Share2, X } from 'lucide-react'

interface InviteModalProps {
  roomId: string
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ roomId, isOpen, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/play/room/${roomId}`
    : `/play/room/${roomId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent */ }
  }

  // Split room ID into groups of 2 for visual display
  const idGroups = roomId.match(/.{1,2}/g) ?? [roomId]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative flex flex-col gap-6 px-8 py-8 border border-neon-purple/40 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-200"
        style={{ background: 'oklch(0.09 0.025 280)', boxShadow: '0 0 40px oklch(0.7 0.25 300 / 0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-neon-purple" />
            <span className="font-mono text-[10px] tracking-widest text-neon-purple">INVITE OPPONENT</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" id="close-invite-modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Room ID visual */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-[9px] tracking-widest text-muted-foreground">ROOM ID</p>
          <div className="flex gap-2">
            {idGroups.map((g, i) => (
              <div
                key={i}
                className="px-3 py-2 border border-neon-gold/40 bg-[oklch(0.12_0.04_280)]"
                style={{ boxShadow: '0 0 8px oklch(0.8 0.18 85 / 0.1)' }}
              >
                <span className="font-mono text-lg tracking-widest text-neon-gold font-bold">{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invite link */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[9px] tracking-widest text-muted-foreground">INVITE LINK</p>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 border border-[oklch(0.2_0.04_280)] bg-[oklch(0.07_0.02_280)] font-mono text-[9px] text-muted-foreground truncate">
              {inviteUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 border-2 font-mono text-[9px] tracking-wider transition-all duration-200 ${copied ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' : 'border-[oklch(0.25_0.06_280)] text-muted-foreground hover:border-neon-cyan/50 hover:text-neon-cyan'}`}
              id="copy-invite-link-btn"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>

        <p className="font-mono text-[8px] tracking-widest text-muted-foreground/60 text-center">
          OPPONENT WILL JOIN AS THE {`BLACK`} PIECES
        </p>
      </div>
    </div>
  )
}
