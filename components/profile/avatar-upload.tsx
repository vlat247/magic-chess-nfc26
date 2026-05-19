'use client'

import React, { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  uid: string
  url: string | null
  username: string | null
  isPro?: boolean
  onUploadComplete: (newUrl: string) => void
}

const AVATAR_SPARKS = [
  { angle: 0,   color: 'oklch(0.7 0.25 300)', size: 2.5 },
  { angle: 45,  color: 'oklch(0.8 0.18 85)',  size: 2   },
  { angle: 90,  color: 'oklch(0.7 0.2 195)',  size: 3   },
  { angle: 135, color: 'oklch(0.7 0.22 330)', size: 2   },
  { angle: 180, color: 'oklch(0.7 0.25 300)', size: 2.5 },
  { angle: 225, color: 'oklch(0.8 0.18 85)',  size: 2   },
  { angle: 270, color: 'oklch(0.7 0.2 195)',  size: 3   },
  { angle: 315, color: 'oklch(0.7 0.22 330)', size: 2   },
]

export function AvatarUpload({ uid, url, username, isPro = false, onUploadComplete }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl]   = useState<string | null>(url)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition]  = useTransition()
  const [isHovered, setIsHovered]     = useState(false)
  const supabase = createClient()

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file     = event.target.files[0]
      const fileExt  = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const newUrl = data.publicUrl

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newUrl })
        .eq('id', uid)
      if (updateError) throw updateError

      setAvatarUrl(newUrl)
      onUploadComplete(newUrl)
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const ringColor      = isPro ? 'oklch(0.8 0.18 85)'  : 'oklch(0.7 0.25 300)'
  const ringColorAlt   = isPro ? 'oklch(0.7 0.22 330)'  : 'oklch(0.7 0.2 195)'
  const ringColorStr   = isPro ? 'border-amber-400/70'  : 'border-neon-purple/70'
  const glowColorStr   = isPro
    ? '0 0 20px oklch(0.8 0.18 85 / 0.6), 0 0 40px oklch(0.8 0.18 85 / 0.3)'
    : '0 0 20px oklch(0.7 0.25 300 / 0.6), 0 0 40px oklch(0.7 0.25 300 / 0.3)'

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Outer slow-spin ring (dashed) ──────────────────────────────── */}
      <div
        className={`absolute -inset-4 rounded-full border border-dashed ${ringColorStr} opacity-50 animate-spin-slow pointer-events-none`}
        style={{ borderWidth: '1px' }}
      />

      {/* ── Middle fast-spin ring (dotted, reversed) ──────────────────── */}
      <div
        className={`absolute -inset-2 rounded-full border border-dotted opacity-40 animate-spin-slow-reverse pointer-events-none`}
        style={{ borderColor: ringColorAlt, borderWidth: '1px' }}
      />

      {/* ── Spark dots on ring positions ───────────────────────────────── */}
      {AVATAR_SPARKS.map((spark, i) => {
        const rad    = (spark.angle * Math.PI) / 180
        const radius = 54  // px from center
        const x      = Math.cos(rad) * radius
        const y      = Math.sin(rad) * radius
        return (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none animate-twinkle"
            style={{
              width: spark.size,
              height: spark.size,
              background: spark.color,
              boxShadow: `0 0 ${spark.size * 2.5}px ${spark.color}`,
              top:  `calc(50% + ${y}px - ${spark.size / 2}px)`,
              left: `calc(50% + ${x}px - ${spark.size / 2}px)`,
              '--dur': `${2.2 + (i % 3) * 0.4}s`,
              animationDelay: `${i * 0.28}s`,
            } as React.CSSProperties}
          />
        )
      })}

      {/* ── Glow ring beneath avatar ───────────────────────────────────── */}
      <div
        className="absolute inset-0 rounded-full blur-md transition-all duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${ringColor} 0%, transparent 70%)`, opacity: isHovered ? 0.35 : 0.18 }}
      />

      {/* ── Avatar itself ─────────────────────────────────────────────── */}
      <Avatar
        className="relative h-24 w-24 border-2 bg-slate-900 transition-all duration-500"
        style={{ borderColor: ringColor, boxShadow: glowColorStr }}
      >
        <AvatarImage src={avatarUrl || ''} alt={username || 'Mage'} className="object-cover" />
        <AvatarFallback
          className="font-bold text-2xl uppercase"
          style={{ background: 'oklch(0.15 0.06 300)', color: ringColor }}
        >
          {username ? username.substring(0, 2) : 'MG'}
        </AvatarFallback>
      </Avatar>

      {/* ── Camera overlay on hover ───────────────────────────────────── */}
      <label
        htmlFor="avatar-upload"
        className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer gap-1"
        style={{ border: `1px solid ${ringColor}` }}
      >
        {isUploading || isPending ? (
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: ringColor }} />
        ) : (
          <>
            <Camera className="h-5 w-5" style={{ color: ringColor }} />
            <span className="font-mono text-[6px] tracking-widest uppercase" style={{ color: ringColor }}>
              UPLOAD
            </span>
          </>
        )}
      </label>
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={isUploading || isPending}
        className="hidden"
      />

      {/* ── PRO crown badge ────────────────────────────────────────────── */}
      {isPro && (
        <div
          className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full font-bold text-[10px] animate-pulse-glow border"
          style={{
            background: 'oklch(0.15 0.04 85)',
            borderColor: 'oklch(0.8 0.18 85 / 0.7)',
            color: 'oklch(0.85 0.18 85)',
            boxShadow: '0 0 8px oklch(0.8 0.18 85 / 0.5)',
          }}
        >
          ♛
        </div>
      )}
    </div>
  )
}
