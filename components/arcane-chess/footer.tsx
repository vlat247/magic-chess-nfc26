interface FooterProps {
  variant?: 'default' | 'grey'
  className?: string
}

export function Footer({ variant = 'default', className = '' }: FooterProps) {
  const isGrey = variant === 'grey'

  return (
    <footer className={`py-8 px-4 border-t-2 transition-colors ${
      isGrey 
        ? 'border-[#2D3748] bg-[#1E2530]/60 backdrop-blur-md' 
        : 'border-border bg-[oklch(0.06_0.02_280)]'
    } ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 flex items-center justify-center ${
              isGrey
                ? 'bg-[#2D3748] pixel-border-steel'
                : 'bg-neon-purple pixel-border'
            }`}>
              <span className={`text-[8px] ${
                isGrey ? 'text-[#BFC7D5] font-mono' : 'text-primary-foreground'
              }`}>AC</span>
            </div>
            <span className={`text-xs ${
              isGrey ? 'text-[#BFC7D5] font-mono tracking-wider' : 'text-neon-purple'
            }`}>
              Arcane Chess
            </span>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className={`text-[10px] text-muted-foreground transition-colors ${
                isGrey ? 'hover:text-[#FACC15]' : 'hover:text-neon-cyan'
              }`}
            >
              Terms
            </a>
            <a 
              href="#" 
              className={`text-[10px] text-muted-foreground transition-colors ${
                isGrey ? 'hover:text-[#FACC15]' : 'hover:text-neon-cyan'
              }`}
            >
              Privacy
            </a>
            <a 
              href="#" 
              className={`text-[10px] text-muted-foreground transition-colors ${
                isGrey ? 'hover:text-[#FACC15]' : 'hover:text-neon-cyan'
              }`}
            >
              Discord
            </a>
            <a 
              href="#" 
              className={`text-[10px] text-muted-foreground transition-colors ${
                isGrey ? 'hover:text-[#FACC15]' : 'hover:text-neon-cyan'
              }`}
            >
              Twitter
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-[8px] text-muted-foreground font-mono">
            © 2024 Arcane Chess. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

