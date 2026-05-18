export function Footer() {
  return (
    <footer className="py-8 px-4 border-t-2 border-border bg-[oklch(0.06_0.02_280)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neon-purple pixel-border flex items-center justify-center">
              <span className="text-[8px] text-primary-foreground">AC</span>
            </div>
            <span className="text-xs text-neon-purple">Arcane Chess</span>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-[10px] text-muted-foreground hover:text-neon-cyan transition-colors">
              Terms
            </a>
            <a href="#" className="text-[10px] text-muted-foreground hover:text-neon-cyan transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[10px] text-muted-foreground hover:text-neon-cyan transition-colors">
              Discord
            </a>
            <a href="#" className="text-[10px] text-muted-foreground hover:text-neon-cyan transition-colors">
              Twitter
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-[8px] text-muted-foreground">
            © 2024 Arcane Chess. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
