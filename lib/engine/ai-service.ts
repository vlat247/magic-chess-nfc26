import { StockfishWorker, AILevel, EngineMessage } from "./stockfish.worker"

/**
 * Singleton AI Service.
 * Manages the underlying StockfishWorker and provides a clean interface for the application.
 */
class ChessAIService {
  private worker: StockfishWorker | null = null
  private subscribers: Set<(msg: EngineMessage) => void> = new Set()

  // Map difficulty levels to Stockfish search depth
  private depthMap: Record<Exclude<AILevel, "none">, number> = {
    easy: 2,
    medium: 7,
    hard: 15,
  }

  public init() {
    if (typeof window !== "undefined" && !this.worker) {
      this.worker = new StockfishWorker()
      this.worker.setOnMessage((msg) => {
        this.subscribers.forEach((sub) => sub(msg))
      })
    }
  }

  public subscribe(callback: (msg: EngineMessage) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  public getBestMove(fen: string, level: Exclude<AILevel, "none">) {
    if (!this.worker) this.init()
    const depth = this.depthMap[level]
    this.worker?.getBestMove(fen, depth)
  }

  public evaluatePosition(fen: string) {
    if (!this.worker) this.init()
    this.worker?.evaluatePosition(fen, 10) // Fast depth for eval bar updates
  }

  public stop() {
    this.worker?.stopThinking()
  }

  public destroy() {
    this.worker?.terminate()
    this.worker = null
  }
}

export const AIService = new ChessAIService()
