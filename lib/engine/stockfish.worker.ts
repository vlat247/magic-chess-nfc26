/**
 * Wrapper for the Stockfish Web Worker.
 * Handles the raw UCI string communication with the stockfish.js worker.
 */

export type AILevel = "easy" | "medium" | "hard" | "none"

export interface EngineMessage {
  bestMove?: string
  evaluation?: number
  isThinking?: boolean
}

export class StockfishWorker {
  private worker: Worker | null = null
  private onMessageCallback: ((msg: EngineMessage) => void) | null = null
  private isThinking = false

  constructor() {
    if (typeof window !== "undefined") {
      // Initialize the worker from the public directory
      this.worker = new Worker("/stockfish.js")
      this.worker.onmessage = this.handleMessage.bind(this)
      this.initEngine()
    }
  }

  private initEngine() {
    this.sendCommand("uci")
    this.sendCommand("isready")
  }

  public setOnMessage(callback: (msg: EngineMessage) => void) {
    this.onMessageCallback = callback
  }

  public getBestMove(fen: string, depth: number) {
    this.isThinking = true
    this.onMessageCallback?.({ isThinking: true })
    
    this.sendCommand("ucinewgame")
    this.sendCommand(`position fen ${fen}`)
    this.sendCommand(`go depth ${depth}`)
  }

  public evaluatePosition(fen: string, depth = 10) {
    this.sendCommand(`position fen ${fen}`)
    this.sendCommand(`go depth ${depth}`)
  }

  public stopThinking() {
    this.sendCommand("stop")
    this.isThinking = false
    this.onMessageCallback?.({ isThinking: false })
  }

  private sendCommand(cmd: string) {
    if (this.worker) {
      this.worker.postMessage(cmd)
    }
  }

  private handleMessage(event: MessageEvent) {
    const line = event.data

    if (typeof line !== "string") return

    // Extract Evaluation (e.g. "info depth 10 score cp 45")
    const scoreCpMatch = line.match(/score cp (-?\d+)/)
    if (scoreCpMatch) {
      const evaluation = parseInt(scoreCpMatch[1], 10) / 100 // Convert centipawns to pawns
      this.onMessageCallback?.({ evaluation })
    }

    // Extract Checkmate Evaluation (e.g. "info depth 10 score mate 3")
    const scoreMateMatch = line.match(/score mate (-?\d+)/)
    if (scoreMateMatch) {
      const mateIn = parseInt(scoreMateMatch[1], 10)
      // Represent mate as a very high evaluation
      const evaluation = mateIn > 0 ? 100 - mateIn : -100 - mateIn
      this.onMessageCallback?.({ evaluation })
    }

    // Extract Best Move (e.g. "bestmove e2e4 ponder e7e5")
    const bestMoveMatch = line.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/)
    if (bestMoveMatch) {
      this.isThinking = false
      this.onMessageCallback?.({ 
        bestMove: bestMoveMatch[1],
        isThinking: false
      })
    }
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }
}
