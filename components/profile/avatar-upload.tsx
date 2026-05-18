'use client'

import React, { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Sparkles } from 'lucide-react'

interface AvatarUploadProps {
  uid: string
  url: string | null
  username: string | null
  onUploadComplete: (newUrl: string) => void
}

export function AvatarUpload({ uid, url, username, onUploadComplete }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const generateMagicAvatar = () => {
    startTransition(async () => {
      try {
        const seed = Math.random().toString(36).substring(7)
        const newAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
        
        // Update user profile in the database
        const { error } = await supabase
          .from('users')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', uid)

        if (error) throw error

        setAvatarUrl(newAvatarUrl)
        onUploadComplete(newAvatarUrl)
      } catch (err) {
        console.error('Error generating magic avatar:', err)
      }
    })
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      // Upload file to Supabase storage (assumes 'avatars' bucket is created and public)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const newUrl = data.publicUrl

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newUrl })
        .eq('id', uid)

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(newUrl)
      onUploadComplete(newUrl)
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message)
      // Fallback to warning or alert
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-purple-500/30 bg-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <AvatarImage src={avatarUrl || ''} alt={username || 'Mage'} className="object-cover" />
          <AvatarFallback className="bg-purple-950 text-purple-300 font-bold text-xl uppercase">
            {username ? username.substring(0, 2) : 'MG'}
          </AvatarFallback>
        </Avatar>

        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-purple-500/40"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          ) : (
            <Camera className="h-6 w-6 text-purple-300" />
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
      </div>

      <div className="flex flex-col items-center sm:items-start gap-2">
        <h3 className="font-bold text-lg text-slate-100">{username || 'Mysterious Mage'}</h3>
        <p className="text-xs text-slate-400">Upload custom sigil or conjure a random arcane avatar.</p>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={generateMagicAvatar}
            disabled={isUploading || isPending}
            className="border-purple-500/20 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30 text-xs gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Conjure Avatar
          </Button>
        </div>
      </div>
    </div>
  )
}
