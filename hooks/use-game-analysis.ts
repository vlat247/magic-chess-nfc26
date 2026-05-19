import { useState, useCallback, useRef } from "react"
import { GameAnalysisReport, MoveAnalysis } from "@/types/analysis"
import { ChessAnalysisService } from "@/lib/engine/analysis-service"

export type AnalysisStatus = "idle" | "analyzing-engine" | "generating-commentary" | "complete" | "error"

// Simple in-memory cache for game analysis reports using the serialized moves history as key
const analysisCache = new Map<string, GameAnalysisReport>()

export function useGameAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>("idle")
  const [progress, setProgress] = useState<number>(0)
  const [report, setReport] = useState<GameAnalysisReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Re-evaluating prevention
  const activeAnalysisRef = useRef<string | null>(null)

  /**
   * Run the complete game analysis pipeline.
   */
  const analyzeGame = useCallback(async (history: string[], startingFen?: string) => {
    const cacheKey = JSON.stringify({ history, startingFen })
    
    // Check cache first for instant load
    if (analysisCache.has(cacheKey)) {
      setReport(analysisCache.get(cacheKey)!)
      setStatus("complete")
      setProgress(100)
      return
    }

    // Prevent duplicate analyses
    if (activeAnalysisRef.current === cacheKey) return
    activeAnalysisRef.current = cacheKey

    setStatus("analyzing-engine")
    setProgress(0)
    setError(null)

    try {
      // 1. Run client-side Stockfish sequential evaluations
      const engineReport = await ChessAnalysisService.analyzeGame(
        history, 
        startingFen,
        (prog) => setProgress(prog)
      )

      setStatus("generating-commentary")

      // 2. Derive Accuracies from ACPL
      // Standard chess mapping formula: accuracy = e^(-0.008 * ACPL)
      const accuracyWhite = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-0.007 * engineReport.acpl.white))))
      const accuracyBlack = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-0.007 * engineReport.acpl.black))))

      const accuracy = {
        white: accuracyWhite,
        black: accuracyBlack
      }

      // 3. Request Server-Side LLM commentary for key blunder positions
      const apiResponse = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          moves: engineReport.moves,
          acpl: engineReport.acpl,
          accuracy,
          counts: engineReport.counts
        })
      })

      if (!apiResponse.ok) {
        throw new Error(`Failed to generate commentary: ${apiResponse.statusText}`)
      }

      const coachData = await apiResponse.json()
      const commentsMap = coachData.commentsMap || {}

      // 4. Merge server commentary back into the move analyses
      const compiledMoves: MoveAnalysis[] = engineReport.moves.map((move) => ({
        ...move,
        commentary: commentsMap[move.moveIndex] || null
      }))

      const finalReport: GameAnalysisReport = {
        moves: compiledMoves,
        accuracy,
        acpl: engineReport.acpl,
        counts: engineReport.counts,
        summary: coachData.summary
      }

      // Store in cache
      analysisCache.set(cacheKey, finalReport)
      setReport(finalReport)
      setStatus("complete")

    } catch (err: any) {
      console.error("Game analysis pipeline error:", err)
      setError(err.message || "An unexpected error occurred during game analysis.")
      setStatus("error")
    } finally {
      activeAnalysisRef.current = null
    }
  }, [])

  const resetAnalysis = useCallback(() => {
    setStatus("idle")
    setProgress(0)
    setReport(null)
    setError(null)
  }, [])

  return {
    status,
    progress,
    report,
    error,
    analyzeGame,
    resetAnalysis
  }
}
