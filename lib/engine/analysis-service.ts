import { Chess } from "chess.js"
import { GameAnalysisReport, MoveAnalysis, MoveQuality, BestMoveInfo } from "@/types/analysis"

class StockfishAnalysisQueue {
  private worker: Worker | null = null
  private currentPromise: {
    resolve: (res: { evaluation: number; bestMove: { from: string; to: string; evaluation: number } }) => void
    reject: (err: any) => void
  } | null = null
  private latestEval = 0

  constructor() {
    if (typeof window !== "undefined") {
      this.worker = new Worker("/stockfish.js")
      this.worker.onmessage = this.handleMessage.bind(this)
      this.sendCommand("uci")
      this.sendCommand("isready")
    }
  }

  private sendCommand(cmd: string) {
    this.worker?.postMessage(cmd)
  }

  private handleMessage(e: MessageEvent) {
    const rawData = e.data
    if (typeof rawData !== "string") return

    // Split by newlines to support batched standard output messages from Stockfish Emscripten worker
    const lines = rawData.split(/\r?\n/)

    for (const line of lines) {
      if (!line.trim()) continue

      // Extract Centipawn evaluation (positive = white winning, negative = black winning)
      const cpMatch = line.match(/score cp (-?\d+)/)
      if (cpMatch) {
        this.latestEval = parseInt(cpMatch[1], 10) / 100 // Convert centipawns to pawns (e.g. +1.5)
      }

      // Extract Mate evaluation
      const mateMatch = line.match(/score mate (-?\d+)/)
      if (mateMatch) {
        const mateIn = parseInt(mateMatch[1], 10)
        // Cap mate at a high bounded evaluation value (e.g. 15 pawns) to keep ACPL balanced
        this.latestEval = mateIn > 0 ? 15 - mateIn / 10 : -15 - mateIn / 10
      }

      // Extract Best Move - substring search fallback to any non-whitespace string (e.g. (none) for checkmates)
      const bestMoveMatch = line.match(/bestmove\s+(\S+)/)
      if (bestMoveMatch && this.currentPromise) {
        const bestMoveStr = bestMoveMatch[1]
        const from = bestMoveStr === "(none)" ? "" : bestMoveStr.substring(0, 2)
        const to = bestMoveStr === "(none)" ? "" : bestMoveStr.substring(2, 4)
        
        const resolve = this.currentPromise.resolve
        this.currentPromise = null
        resolve({
          evaluation: this.latestEval,
          bestMove: {
            from,
            to,
            evaluation: this.latestEval
          }
        })
        break
      }
    }
  }

  public evaluate(fen: string, depth = 12): Promise<{ evaluation: number; bestMove: { from: string; to: string; evaluation: number } }> {
    return new Promise((resolve, reject) => {
      // ── DEFENSIVE STATIC GAME-OVER EVALUATION ────────────────────────────
      // If the position is already checkmate, stalemate, or draw, resolve instantly
      // without invoking Stockfish to prevent potential Web Worker stalls.
      try {
        const chess = new Chess(fen)
        if (chess.isGameOver()) {
          let evaluation = 0
          if (chess.isCheckmate()) {
            // If it is Black to move ('b') and Black is in checkmate, White won (+15)
            // If it is White to move ('w') and White is in checkmate, Black won (-15)
            const turn = chess.turn()
            evaluation = turn === "b" ? 15 : -15
          }
          resolve({
            evaluation,
            bestMove: {
              from: "",
              to: "",
              evaluation
            }
          })
          return
        }
      } catch (e) {
        console.warn("Analysis: error checking game over for FEN:", fen, e)
      }

      // Determine side to move from FEN to align perspectives
      const parts = fen.split(" ")
      const turn = parts[1] || "w"

      this.currentPromise = { 
        resolve: (res) => {
          // Flip evaluation to White's perspective if it's Black's turn
          const absoluteEval = turn === "b" ? -res.evaluation : res.evaluation
          
          resolve({
            evaluation: absoluteEval,
            bestMove: {
              ...res.bestMove,
              evaluation: absoluteEval
            }
          })
        }, 
        reject 
      }
      this.latestEval = 0
      this.sendCommand(`position fen ${fen}`)
      this.sendCommand(`go depth ${depth}`)
    })
  }

  public terminate() {
    this.worker?.terminate()
    this.worker = null
  }
}

/**
 * Game Analysis Service.
 * Reconstructs chess game positions and analyzes them sequentially using a dedicated client-side Stockfish queue.
 */
export class ChessAnalysisService {
  /**
   * Helper to convert coordinate moves to SAN format.
   */
  private static coordsToSan(fenBefore: string, from: string, to: string): string {
    if (!from || !to) return "None"
    const c = new Chess(fenBefore)
    try {
      const move = c.move({ from, to, promotion: "q" })
      return move.san
    } catch {
      return `${from.toUpperCase()}→${to.toUpperCase()}`
    }
  }

  /**
   * Analyzes an array of game moves.
   */
  public static async analyzeGame(
    history: string[],
    startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    onProgress?: (progress: number) => void
  ): Promise<Omit<GameAnalysisReport, "summary" | "moves" | "accuracy"> & { moves: Omit<MoveAnalysis, "commentary">[] }> {
    
    // 1. Reconstruct all board states (FENs) and standard moves
    const chess = new Chess()
    try {
      chess.load(startingFen)
    } catch {
      chess.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    }

    const fens: string[] = [chess.fen()]
    const cleanMoves: { from: string; to: string; san: string; moveIndex: number }[] = []

    history.forEach((log, index) => {
      // Skip magic spell casting annotations (e.g. starting with "✨")
      if (log.startsWith("✨")) {
        return
      }

      try {
        // Find square mappings by matching standard SAN or attempting move applications
        const prevFen = chess.fen()
        const moveObj = chess.move(log)
        
        cleanMoves.push({
          from: moveObj.from,
          to: moveObj.to,
          san: log,
          moveIndex: index
        })
        fens.push(chess.fen())
      } catch (e) {
        console.warn("Analysis: skipped unparsable chess move/spell log:", log)
      }
    })

    const queue = new StockfishAnalysisQueue()
    const totalPositions = fens.length
    const evaluations: number[] = []
    const bestMoves: { from: string; to: string; evaluation: number }[] = []

    try {
      // 2. Evaluate all positions in sequence
      for (let i = 0; i < totalPositions; i++) {
        const result = await queue.evaluate(fens[i], 12) // Quick depth 12 analysis
        evaluations.push(result.evaluation)
        bestMoves.push(result.bestMove)

        if (onProgress) {
          onProgress(Math.round((i / totalPositions) * 100))
        }
      }
      if (onProgress) {
        onProgress(100)
      }
    } finally {
      queue.terminate()
    }

    // 3. Compile move analyses and statistics
    const movesReport: Omit<MoveAnalysis, "commentary">[] = []
    const counts = {
      white: { book: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, missed_win: 0 },
      black: { book: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, missed_win: 0 }
    }

    let whiteCplSum = 0
    let blackCplSum = 0
    let whiteMovesCount = 0
    let blackMovesCount = 0

    cleanMoves.forEach((move, i) => {
      const isWhite = i % 2 === 0
      const turnLabel = isWhite ? "white" : "black"
      
      const fenBefore = fens[i]
      const fenAfter = fens[i + 1]
      
      const evalBefore = evaluations[i]
      const evalAfter = evaluations[i + 1]

      // Calculate centipawn loss (CPL) - positive value representing quality drop
      let cpl = 0
      if (isWhite) {
        cpl = Math.max(0, evalBefore - evalAfter)
      } else {
        cpl = Math.max(0, evalAfter - evalBefore)
      }

      // Convert evaluations to centipawns for standard display
      const cplPoints = Math.round(cpl * 100)

      if (isWhite) {
        whiteCplSum += cplPoints
        whiteMovesCount++
      } else {
        blackCplSum += cplPoints
        blackMovesCount++
      }

      // Determine move quality label
      let quality: MoveQuality = "excellent"
      const isBestMove = move.from === bestMoves[i].from && move.to === bestMoves[i].to

      // Opening book classification for first 4 plys
      if (i < 4 && cplPoints <= 15) {
        quality = "book"
      } else if (isBestMove || cplPoints <= 10) {
        quality = "excellent"
      } else if (cplPoints <= 40) {
        quality = "good"
      } else if (cplPoints <= 100) {
        quality = "inaccuracy"
      } else if (cplPoints <= 200) {
        quality = "mistake"
      } else {
        quality = "blunder"
      }

      // Missed Win classification (having winning advantage and dropping it)
      if (isWhite && evalBefore >= 2.0 && evalAfter <= 0.5) {
        quality = "missed_win"
      } else if (!isWhite && evalBefore <= -2.0 && evalAfter >= -0.5) {
        quality = "missed_win"
      }

      counts[turnLabel][quality]++

      const bestMoveInfo: BestMoveInfo = {
        from: bestMoves[i].from,
        to: bestMoves[i].to,
        evaluation: bestMoves[i].evaluation,
        san: this.coordsToSan(fenBefore, bestMoves[i].from, bestMoves[i].to)
      }

      movesReport.push({
        moveIndex: move.moveIndex,
        san: move.san,
        from: move.from,
        to: move.to,
        fenBefore,
        fenAfter,
        evaluation: evalAfter,
        bestMove: bestMoveInfo,
        centipawnLoss: cplPoints,
        quality
      })
    })

    const acpl = {
      white: whiteMovesCount > 0 ? Math.round(whiteCplSum / whiteMovesCount) : 0,
      black: blackMovesCount > 0 ? Math.round(blackCplSum / blackMovesCount) : 0
    }

    return {
      moves: movesReport,
      acpl,
      counts
    }
  }
}
