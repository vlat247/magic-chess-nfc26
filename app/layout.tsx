import type { Metadata } from 'next'
import { Press_Start_2P, Geist, Jacquard_24 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/providers/auth-provider'
import { OnboardingWizard } from '@/components/arcane-chess/onboarding-wizard'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const pressStart = Press_Start_2P({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-pixel'
});

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist'
});

const jacquard = Jacquard_24({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-jacquard'
});

export const metadata: Metadata = {
  title: 'Arcane Chess - Chess & Magic',
  description: 'A fantasy chess platform with chaotic spell modes, AI coach, and competitive classic gameplay. Break the rules of chess.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" className={`${pressStart.variable} ${geist.variable} ${jacquard.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider initialSession={session}>
          {children}
          <OnboardingWizard />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

