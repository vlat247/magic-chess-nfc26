"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { useGameAnalysis } from "@/hooks/use-game-analysis"
import { MoveAnalysis, MoveQuality } from "@/types/analysis"
import { ChevronLeft, ChevronRight, Award, AlertCircle, RefreshCw, Zap, TrendingUp, HelpCircle } from "lucide-react"

const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
)

interface GameAnalysisDashboardProps {
  history: string[]
  startingFen?: string
  onClose: () => void
}

const QUALITY_STYLES: Record<MoveQuality, { label: string; bg: string; border: string; text: string; glow: string }> = {
  book: { label: "Book Move", bg: "bg-slate-500/10", border: "border-slate-500/40", text: "text-slate-400", glow: "shadow-[0_0_8px_rgba(148,163,184,0.15)]" },
  excellent: { label: "Excellent", bg: "bg-cyan-500/10", border: "border-cyan-500/40", text: "text-cyan-400", glow: "shadow-[0_0_8px_rgba(34,211,238,0.25)]" },
  good: { label: "Good Move", bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400", glow: "shadow-[0_0_8px_rgba(16,185,129,0.2)]" },
  inaccuracy: { label: "Inaccuracy", bg: "bg-yellow-500/10", border: "border-yellow-500/40", text: "text-yellow-400", glow: "shadow-[0_0_8px_rgba(234,179,8,0.2)]" },
  mistake: { label: "Mistake", bg: "bg-orange-500/10", border: "border-orange-500/40", text: "text-orange-400", glow: "shadow-[0_0_8px_rgba(249,115,22,0.25)]" },
  blunder: { label: "Blunder", bg: "bg-pink-500/10", border: "border-pink-500/40", text: "text-pink-400", glow: "shadow-[0_0_12px_rgba(244,63,94,0.35)] animate-pulse" },
  missed_win: { label: "Missed Win", bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400", glow: "shadow-[0_0_12px_rgba(245,158,11,0.3)]" }
}

export function GameAnalysisDashboard({ history, startingFen, onClose }: GameAnalysisDashboardProps) {
  const { status, progress, report, error, analyzeGame } = useGameAnalysis()

  // Currently selected move index inside the analyzed moves array
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  // Toggle to see stockfish suggested alternative instead
  const [showBestMove, setShowBestMove] = useState(false)
  const [boardWidth, setBoardWidth] = useState(380)

  // Trigger analysis automatically on mount
  useEffect(() => {
    if (history.length > 0) {
      analyzeGame(history, startingFen)
    }
  }, [history, startingFen, analyzeGame])

  // Set selected index to first move once report loaded
  useEffect(() => {
    if (report && report.moves.length > 0 && selectedIndex === -1) {
      setSelectedIndex(0)
    }
  }, [report, selectedIndex])

  // Reset best move toggle on index changes
  useEffect(() => {
    setShowBestMove(false)
  }, [selectedIndex])

  // Responsive board sizing
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 480) {
        setBoardWidth(width - 48)
      } else if (width < 768) {
        setBoardWidth(340)
      } else if (width < 1024) {
        setBoardWidth(380)
      } else {
        setBoardWidth(440)
      }
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate current FEN to display on the board
  const activeFen = useMemo(() => {
    if (!report || report.moves.length === 0) return startingFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    
    // Index -1 represents starting board
    if (selectedIndex === -1) return startingFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    
    const move = report.moves[selectedIndex]
    if (showBestMove && move.bestMove) {
      // Re-apply best move to FEN before to show what it would look like
      // Since bestMove contains {from, to}, we can return FEN after player's move for simplicity
      // Or show the evaluation suggestion. We can just highlight it instead, or evaluate it.
      // For simplicity, FEN after player's move is standard.
      return move.fenBefore
    }
    return move.fenAfter
  }, [report, selectedIndex, showBestMove, startingFen])

  const selectedMove: MoveAnalysis | null = useMemo(() => {
    if (!report || report.moves.length === 0 || selectedIndex === -1) return null
    return report.moves[selectedIndex]
  }, [report, selectedIndex])

  // Re-evaluating custom SVG path mapping for evaluation graph
  const evaluationGraphData = useMemo(() => {
    if (!report || report.moves.length === 0) return null

    const evals = [0, ...report.moves.map(m => m.evaluation)]
    const width = 500
    const height = 120
    const padding = 10
    
    const usableWidth = width - padding * 2
    const usableHeight = height - padding * 2
    const centerY = height / 2

    // Map each evaluation (-10 to +10 range) to Y coordinates
    const points = evals.map((val, idx) => {
      const x = padding + (idx / (evals.length - 1)) * usableWidth
      // Clamp evaluations between -8 and +8 pawns for prettier graphing
      const clamped = Math.max(-8, Math.min(8, val))
      const y = centerY - (clamped / 8) * (usableHeight / 2)
      return { x, y }
    })

    // Construct SVG path string
    let pathD = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`
    }

    // White shading (above line) and Black shading (below line)
    let whiteFillD = `M ${points[0].x} ${centerY}`
    let blackFillD = `M ${points[0].x} ${centerY}`

    points.forEach((p) => {
      if (p.y <= centerY) {
        whiteFillD += ` L ${p.x} ${p.y}`
        blackFillD += ` L ${p.x} ${centerY}`
      } else {
        whiteFillD += ` L ${p.x} ${centerY}`
        blackFillD += ` L ${p.x} ${p.y}`
      }
    })

    whiteFillD += ` L ${points[points.length - 1].x} ${centerY} Z`
    blackFillD += ` L ${points[points.length - 1].x} ${centerY} Z`

    return {
      width,
      height,
      centerY,
      pathD,
      whiteFillD,
      blackFillD,
      points
    }
  }, [report])

  // Group moves into pairs (e.g. 1. e4 e5) for timeline display
  const movePairs = useMemo(() => {
    if (!report) return []
    const pairs: { index: number; white: MoveAnalysis; black?: MoveAnalysis }[] = []
    
    for (let i = 0; i < report.moves.length; i += 2) {
      pairs.push({
        index: Math.floor(i / 2) + 1,
        white: report.moves[i],
        black: report.moves[i + 1]
      })
    }
    return pairs
  }, [report])

  if (status === "idle" || status === "analyzing-engine" || status === "generating-commentary") {
    return (
      <div className="w-full max-w-4xl p-8 bg-[oklch(0.08_0.02_280)] border-2 border-neon-cyan/50 backdrop-blur-md rounded-md flex flex-col items-center justify-center min-h-[500px] text-center select-none">
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-24 h-24 border-4 border-dashed border-neon-cyan rounded-full animate-spin" style={{ animationDuration: "10s" }} />
          <div className="absolute w-16 h-16 border-2 border-dotted border-neon-purple rounded-full animate-spin-reverse" style={{ animationDuration: "5s" }} />
          <Zap className="absolute text-neon-cyan animate-pulse" size={28} />
        </div>

        <h3 className="text-lg md:text-2xl font-title text-neon-cyan text-glow-cyan uppercase tracking-wider mb-2">
          {status === "analyzing-engine" ? "Archmage Scanning Battlefield..." : "Distilling Magical Runes..."}
        </h3>
        
        <p className="text-xs md:text-sm font-mono text-muted-foreground max-w-md mb-6">
          {status === "analyzing-engine" 
            ? "Stockfish is evaluating turn sequences, measuring spatial metrics, and calculating centipawn currents."
            : "Consulting with the Qwen Oracle to compile your tactical narrative and spell critiques."}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-sm h-3 bg-muted border border-muted-foreground/30 p-0.5 rounded-sm overflow-hidden mb-2 relative">
          <div 
            className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-gold transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-xs text-neon-cyan">{progress}% ANALYZED</span>
      </div>
    )
  }

  if (status === "error" || !report) {
    return (
      <div className="w-full max-w-md p-8 bg-[oklch(0.08_0.02_280)] border-2 border-destructive bg-destructive/5 backdrop-blur-md rounded-md flex flex-col items-center text-center">
        <AlertCircle className="text-destructive mb-4" size={48} />
        <h3 className="text-lg font-title text-destructive tracking-wider uppercase mb-2">
          ANALYSIS FAILURE
        </h3>
        <p className="text-xs font-mono text-muted-foreground mb-6">
          {error || "An unexpected disturbance occurred while casting the analysis spell."}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 font-mono text-xs tracking-wider border-2 border-neon-purple text-neon-purple hover:bg-neon-purple/10 transition-all glow-purple hover:text-white"
        >
          RETURN TO FIELD
        </button>
      </div>
    )
  }

  const { accuracy, acpl, counts, summary } = report

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 items-center">
      {/* Head Header */}
      <div className="w-full flex items-center justify-between border-b border-[oklch(0.2_0.04_280)] pb-4">
        <div>
          <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
            Battlefield Diagnostic
          </span>
          <h2 className="text-xl md:text-3xl text-glow-gold text-neon-gold font-title tracking-wider mt-1 select-none">
            AI COACH REPORT
          </h2>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 font-mono text-[10px] tracking-wider border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 transition-all glow-cyan hover:text-white"
        >
          LEAVE REVIEW
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Chessboard & Recommendations */}
        <div className="lg:col-span-7 flex flex-col gap-4 items-center justify-start w-full">
          <div className="pixel-border glow-purple p-2 bg-[oklch(0.08_0.02_280)] w-full flex justify-center">
            <div 
              className="relative border-4 border-[oklch(0.2_0.04_280)] bg-black"
              style={{ width: boardWidth, height: boardWidth }}
            >
              <Chessboard
                key={activeFen}
                options={{
                  position: activeFen,
                  allowDragging: false,
                  boardOrientation: "white",
                  lightSquareStyle: {
                    backgroundColor: "oklch(0.86 0.06 280)",
                    boxShadow: "inset 0 0 10px oklch(0.7 0.15 280 / 0.15)",
                  },
                  darkSquareStyle: {
                    backgroundColor: "oklch(0.46 0.13 280)",
                  },
                  animationDurationInMs: 200,
                  // Show visual indicators on selected square or best move
                  squareStyles: selectedMove ? {
                    [selectedMove.from]: {
                      background: "rgba(244, 63, 94, 0.2)",
                      boxShadow: "inset 0 0 12px var(--neon-pink)",
                    },
                    [selectedMove.to]: {
                      background: "rgba(244, 63, 94, 0.45)",
                      boxShadow: "inset 0 0 12px var(--neon-pink)",
                    },
                    ...(showBestMove && selectedMove.bestMove ? {
                      [selectedMove.bestMove.from]: {
                        background: "rgba(34, 211, 238, 0.2)",
                        boxShadow: "inset 0 0 12px var(--neon-cyan)",
                      },
                      [selectedMove.bestMove.to]: {
                        background: "rgba(34, 211, 238, 0.45)",
                        boxShadow: "inset 0 0 12px var(--neon-cyan)",
                      }
                    } : {})
                  } : {}
                }}
              />
            </div>
          </div>

          {/* Navigation Controls under board */}
          <div className="flex items-center justify-between w-full bg-[oklch(0.08_0.02_280)] border border-[oklch(0.2_0.04_280)] p-2">
            <button
              onClick={() => setSelectedIndex(-1)}
              disabled={selectedIndex === -1}
              className="p-1 font-mono text-[9px] tracking-wider text-muted-foreground hover:text-white disabled:opacity-40 disabled:hover:text-muted-foreground transition-all uppercase"
            >
              START
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedIndex(prev => Math.max(-1, prev - 1))}
                disabled={selectedIndex === -1}
                className="p-1.5 border border-[oklch(0.2_0.04_280)] text-muted-foreground hover:text-white hover:border-white/20 disabled:opacity-30 transition-all rounded-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-mono text-xs text-foreground px-3 flex items-center min-w-[70px] justify-center select-none">
                {selectedIndex === -1 ? "START" : `MOVE ${selectedIndex + 1}/${report.moves.length}`}
              </span>
              <button
                onClick={() => setSelectedIndex(prev => Math.min(report.moves.length - 1, prev + 1))}
                disabled={selectedIndex === report.moves.length - 1}
                className="p-1.5 border border-[oklch(0.2_0.04_280)] text-muted-foreground hover:text-white hover:border-white/20 disabled:opacity-30 transition-all rounded-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => setSelectedIndex(report.moves.length - 1)}
              disabled={selectedIndex === report.moves.length - 1}
              className="p-1 font-mono text-[9px] tracking-wider text-muted-foreground hover:text-white disabled:opacity-40 disabled:hover:text-muted-foreground transition-all uppercase"
            >
              END
            </button>
          </div>

          {/* Selected Move Analysis Pane */}
          {selectedMove ? (
            <div className="w-full bg-[oklch(0.085_0.02_280)] border border-[oklch(0.2_0.04_280)] p-4 flex flex-col gap-3 relative overflow-hidden">
              
              {/* Quality Banner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">Played:</span>
                  <span className="font-mono text-sm font-bold text-white">{selectedMove.san}</span>
                  <div className={`ml-2 px-2.5 py-0.5 font-mono text-[9px] font-bold border rounded-full uppercase ${QUALITY_STYLES[selectedMove.quality].bg} ${QUALITY_STYLES[selectedMove.quality].border} ${QUALITY_STYLES[selectedMove.quality].text} ${QUALITY_STYLES[selectedMove.quality].glow}`}>
                    {QUALITY_STYLES[selectedMove.quality].label}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  CP Loss: <span className={selectedMove.centipawnLoss > 40 ? "text-neon-pink" : "text-neon-cyan"}>{selectedMove.centipawnLoss}</span>
                </span>
              </div>

              {/* Best Move suggestion */}
              {selectedMove.quality !== "excellent" && selectedMove.quality !== "book" && selectedMove.bestMove && (
                <div className="bg-[oklch(0.12_0.03_280)] border border-neon-cyan/20 p-3 rounded-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-neon-cyan" />
                      <span className="font-mono text-[9px] text-neon-cyan uppercase tracking-wider">Tactical Superior suggestion</span>
                    </div>
                    <button
                      onClick={() => setShowBestMove(!showBestMove)}
                      className={`px-2 py-0.5 rounded-sm font-mono text-[8px] tracking-wider border transition-all ${
                        showBestMove 
                          ? "bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                          : "border-cyan-500/40 text-neon-cyan hover:bg-cyan-500/10"
                      }`}
                    >
                      {showBestMove ? "HIDE RECOMMENDED" : "SHOW RECOMMENDED"}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-foreground/90">
                    A stronger move was <span className="text-neon-cyan font-bold">{selectedMove.bestMove.san}</span> (eval: {selectedMove.bestMove.evaluation > 0 ? `+${selectedMove.bestMove.evaluation.toFixed(1)}` : selectedMove.bestMove.evaluation.toFixed(1)}).
                  </p>
                </div>
              )}

              {/* Dynamic move comments */}
              <div className="border-t border-[oklch(0.18_0.03_280)] pt-3 flex flex-col gap-1.5">
                <span className="font-mono text-[9px] text-neon-gold uppercase tracking-wider">Archmage explanation</span>
                <p className="text-xs text-foreground/80 leading-relaxed italic">
                  {selectedMove.commentary || "This move maintains coordinates without volatility. Excellent casting."}
                </p>
              </div>

            </div>
          ) : (
            <div className="w-full bg-[oklch(0.085_0.02_280)] border border-[oklch(0.2_0.04_280)] p-6 text-center select-none flex flex-col items-center justify-center min-h-[140px]">
              <HelpCircle className="text-muted-foreground/30 mb-2" size={24} style={{ animationDuration: "3s" }} />
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                SELECT A MOVE ON TIMELINE TO DIAGNOSE
              </span>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Statistics, Overall summary & timeline */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* STATS BREAKDOWN CARD */}
          <div className="bg-[oklch(0.085_0.02_280)] border border-[oklch(0.2_0.04_280)] p-4 flex flex-col gap-4 relative overflow-hidden">
            {/* Corner decorations */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-neon-cyan" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-neon-purple" />

            <span className="font-mono text-[9px] text-neon-purple uppercase tracking-wider">Combatant Metrics</span>
            
            {/* Accuracy rows */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-[10px] text-glow-gold text-neon-gold font-bold">LIGHT MAGICIANS</span>
                  <span className="font-mono text-lg font-bold text-white">{accuracy.white}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden p-0.5 border border-muted-foreground/20">
                  <div className="h-full bg-neon-gold glow-gold rounded-full" style={{ width: `${accuracy.white}%` }} />
                </div>
                <span className="font-mono text-[8px] text-muted-foreground text-right">ACPL: {acpl.white}</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-[10px] text-glow-cyan text-neon-cyan font-bold">DARK MAGICIAN</span>
                  <span className="font-mono text-lg font-bold text-white">{accuracy.black}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden p-0.5 border border-muted-foreground/20">
                  <div className="h-full bg-neon-cyan glow-cyan rounded-full" style={{ width: `${accuracy.black}%` }} />
                </div>
                <span className="font-mono text-[8px] text-muted-foreground text-right">ACPL: {acpl.black}</span>
              </div>
            </div>

            {/* Quality totals counts breakdown */}
            <div className="border-t border-[oklch(0.18_0.03_280)] pt-3 flex flex-col gap-2">
              <div className="grid grid-cols-3 font-mono text-[8px] text-muted-foreground border-b border-[oklch(0.18_0.03_280)] pb-1.5 text-center uppercase tracking-wider font-bold">
                <div>WHITE</div>
                <div>METRIC</div>
                <div>BLACK</div>
              </div>
              
              <StatRow label="Blunders" white={counts.white.blunder} black={counts.black.blunder} color="text-pink-400" />
              <StatRow label="Mistakes" white={counts.white.mistake} black={counts.black.mistake} color="text-orange-400" />
              <StatRow label="Inaccuracies" white={counts.white.inaccuracy} black={counts.black.inaccuracy} color="text-yellow-400" />
              <StatRow label="Missed Wins" white={counts.white.missed_win} black={counts.black.missed_win} color="text-amber-400" />
              <StatRow label="Excellent/Book" white={counts.white.excellent + counts.white.book} black={counts.black.excellent + counts.black.book} color="text-cyan-400" />
            </div>

          </div>

          {/* OVERALL ARCHMAGE SUMMARY CARD */}
          <div className="bg-[oklch(0.08_0.02_280)] border-2 border-neon-gold/50 p-4 rounded-sm relative shadow-[inset_0_0_15px_rgba(234,179,8,0.05),0_0_15px_rgba(234,179,8,0.15)] flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Award className="text-neon-gold animate-pulse" size={16} />
              <span className="font-mono text-[9px] text-neon-gold uppercase tracking-wider font-bold">Archmage Narrative Summary</span>
            </div>
            <p className="text-xs text-foreground/95 leading-relaxed italic">
              "{summary || "The battlefield patterns dissolve. Both spellcasters demonstrated standard formations with instances of volatile coordinate lapses."}"
            </p>
          </div>

          {/* EVALUATION GRAPH */}
          {evaluationGraphData && (
            <div className="bg-[oklch(0.085_0.02_280)] border border-[oklch(0.2_0.04_280)] p-4 flex flex-col gap-3 relative">
              <span className="font-mono text-[9px] text-neon-cyan uppercase tracking-wider">Evaluation Swing curve</span>
              
              <div className="w-full bg-[oklch(0.05_0.01_280)] border border-white/5 rounded-sm p-2 flex items-center justify-center">
                <svg 
                  viewBox={`0 0 ${evaluationGraphData.width} ${evaluationGraphData.height}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="whiteAdvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="blackAdvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.0" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="10" y1="20" x2="490" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="10" y1="100" x2="490" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* Center Base Line (0.0 evaluation) */}
                  <line 
                    x1="10" 
                    y1={evaluationGraphData.centerY} 
                    x2="490" 
                    y2={evaluationGraphData.centerY} 
                    stroke="rgba(168,85,247,0.3)" 
                    strokeWidth="1.5"
                  />

                  {/* Shading zones */}
                  <path d={evaluationGraphData.whiteFillD} fill="url(#whiteAdvGradient)" />
                  <path d={evaluationGraphData.blackFillD} fill="url(#blackAdvGradient)" />

                  {/* Evaluation Path */}
                  <path 
                    d={evaluationGraphData.pathD} 
                    fill="none" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="2.5" 
                    className="drop-shadow-[0_0_4px_rgba(168,85,247,0.7)]"
                  />
                  
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>

                  {/* Floating selected move index bar indicator */}
                  {selectedIndex !== -1 && evaluationGraphData.points[selectedIndex + 1] && (
                    <g>
                      <line 
                        x1={evaluationGraphData.points[selectedIndex + 1].x} 
                        y1="10" 
                        x2={evaluationGraphData.points[selectedIndex + 1].x} 
                        y2="110" 
                        stroke="rgba(244,63,94,0.7)" 
                        strokeWidth="1.5" 
                        strokeDasharray="2 2"
                      />
                      <circle 
                        cx={evaluationGraphData.points[selectedIndex + 1].x} 
                        cy={evaluationGraphData.points[selectedIndex + 1].y} 
                        r="4" 
                        fill="#f43f5e" 
                        className="animate-pulse shadow-md"
                      />
                    </g>
                  )}
                </svg>
              </div>

              {/* Labels under graph */}
              <div className="flex justify-between font-mono text-[8px] text-muted-foreground px-1">
                <span>WHITE ADVANTAGE (GOLD)</span>
                <span>BLACK ADVANTAGE (CYAN)</span>
              </div>
            </div>
          )}

          {/* SCROLLABLE MOVE TIMELINE SIDEBAR */}
          <div className="bg-[oklch(0.085_0.02_280)] border border-[oklch(0.2_0.04_280)] p-4 flex flex-col gap-3 h-[240px] relative">
            <span className="font-mono text-[9px] text-neon-cyan uppercase tracking-wider">Game Chronology Timeline</span>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 select-none scrollbar-thin">
              {movePairs.map((pair) => (
                <div key={pair.index} className="grid grid-cols-12 gap-2 text-xs font-mono items-center py-1 border-b border-[oklch(0.15_0.03_280)] last:border-0">
                  
                  {/* Pair index */}
                  <div className="col-span-2 text-muted-foreground font-bold">{pair.index}.</div>
                  
                  {/* White move */}
                  <div 
                    onClick={() => setSelectedIndex((pair.index - 1) * 2)}
                    className={`col-span-5 flex items-center justify-between px-2 py-1.5 rounded-sm cursor-pointer transition-all border ${
                      selectedIndex === (pair.index - 1) * 2
                        ? "bg-purple-600/25 border-purple-500/60 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                        : "border-transparent text-foreground/80 hover:bg-white/5"
                    }`}
                  >
                    <span>{pair.white.san}</span>
                    <span className={`w-2 h-2 rounded-full ${QUALITY_STYLES[pair.white.quality].bg} ${QUALITY_STYLES[pair.white.quality].border} border ${QUALITY_STYLES[pair.white.quality].glow}`} />
                  </div>
                  
                  {/* Black move */}
                  {pair.black ? (
                    <div 
                      onClick={() => setSelectedIndex((pair.index - 1) * 2 + 1)}
                      className={`col-span-5 flex items-center justify-between px-2 py-1.5 rounded-sm cursor-pointer transition-all border ${
                        selectedIndex === (pair.index - 1) * 2 + 1
                          ? "bg-purple-600/25 border-purple-500/60 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                          : "border-transparent text-foreground/80 hover:bg-white/5"
                      }`}
                    >
                      <span>{pair.black.san}</span>
                      <span className={`w-2 h-2 rounded-full ${QUALITY_STYLES[pair.black.quality].bg} ${QUALITY_STYLES[pair.black.quality].border} border ${QUALITY_STYLES[pair.black.quality].glow}`} />
                    </div>
                  ) : (
                    <div className="col-span-5" />
                  )}

                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

// Subcomponents
interface StatRowProps {
  label: string
  white: number
  black: number
  color?: string
}

function StatRow({ label, white, black, color = "" }: StatRowProps) {
  return (
    <div className="grid grid-cols-3 font-mono text-[10px] items-center text-center py-0.5">
      <div className="text-white font-bold">{white}</div>
      <div className={`text-[8px] uppercase tracking-wider text-muted-foreground ${color}`}>{label}</div>
      <div className="text-white font-bold">{black}</div>
    </div>
  )
}
