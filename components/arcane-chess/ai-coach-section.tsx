"use client"

export function AICoachSection() {
  return (
    <section className="py-20 px-4 relative">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section title */}
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl text-glow-gold mb-4">
            <span className="text-neon-gold">AI</span>
            <span className="text-foreground"> Coach</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Learn from every game
          </p>
        </div>
        
        {/* Terminal/RPG dialog box */}
        <div className="relative bg-[oklch(0.08_0.02_280)] border-2 border-neon-cyan p-1">
          {/* Window header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.12_0.03_280)] border-b-2 border-neon-cyan/30">
            <div className="w-2 h-2 bg-neon-cyan" />
            <div className="w-2 h-2 bg-neon-purple" />
            <div className="w-2 h-2 bg-neon-gold" />
            <span className="ml-4 text-[10px] md:text-xs text-neon-cyan">POST-GAME ANALYSIS</span>
          </div>
          
          {/* Terminal content */}
          <div className="p-6 space-y-4">
            {/* Analysis lines with typing effect simulation */}
            <AnalysisLine 
              prefix="[!]" 
              text="You lost center control early" 
              type="warning"
            />
            <AnalysisLine 
              prefix="[-]" 
              text="Knight development was weak" 
              type="error"
            />
            <AnalysisLine 
              prefix="[*]" 
              text="Winning move missed on turn 12" 
              type="info"
            />
            <AnalysisLine 
              prefix="[+]" 
              text="Good pawn structure maintained" 
              type="success"
            />
            
            {/* Cursor blink */}
            <div className="flex items-center gap-2 pt-4">
              <span className="text-neon-cyan text-xs">{">"}</span>
              <span className="w-2 h-4 bg-neon-cyan animate-pulse" />
            </div>
          </div>
          
          {/* Pixel corners */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-neon-cyan" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-neon-cyan" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-neon-cyan" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-neon-cyan" />
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <StatBox label="Accuracy" value="73%" color="cyan" />
          <StatBox label="Mistakes" value="4" color="purple" />
          <StatBox label="Best Move" value="Nf6" color="gold" />
        </div>
      </div>
    </section>
  )
}

interface AnalysisLineProps {
  prefix: string
  text: string
  type: "warning" | "error" | "info" | "success"
}

function AnalysisLine({ prefix, text, type }: AnalysisLineProps) {
  const colors = {
    warning: 'text-neon-gold',
    error: 'text-neon-pink',
    info: 'text-neon-cyan',
    success: 'text-neon-purple'
  }
  
  return (
    <div className="flex items-start gap-3">
      <span className={`text-xs ${colors[type]} font-mono`}>{prefix}</span>
      <span className="text-xs md:text-sm text-foreground/80">{text}</span>
    </div>
  )
}

interface StatBoxProps {
  label: string
  value: string
  color: "cyan" | "purple" | "gold"
}

function StatBox({ label, value, color }: StatBoxProps) {
  const colorClasses = {
    cyan: 'border-neon-cyan text-neon-cyan',
    purple: 'border-neon-purple text-neon-purple',
    gold: 'border-neon-gold text-neon-gold'
  }
  
  return (
    <div className={`p-4 bg-card border-2 ${colorClasses[color]} text-center`}>
      <div className="text-lg md:text-2xl mb-1">{value}</div>
      <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  )
}
