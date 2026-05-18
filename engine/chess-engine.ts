import { Chess, Square } from "chess.js"

export interface GameStatus {
  isGameOver: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isCheck: boolean
  turn: "w" | "b"
  winner: "w" | "b" | null
}

// Single persistent Chess instance to perform state validations without allocations
const chessInstance = new Chess()

/**
 * Pure and encapsulated Chess Engine Service.
 * Performs fast, stateless computations by syncing a single, reusable Chess.js instance.
 * Completely prepared for future Stockfish web worker integrations and multiplayer state synchronizations.
 */
export class ChessEngineService {
  /**
   * Synchronizes the single internal chess.js instance to the given FEN.
   * Internal utility to avoid allocating new Chess() objects.
   */
  private static sync(fen: string): Chess {
    try {
      if (chessInstance.fen() !== fen) {
        chessInstance.load(fen)
      }
    } catch {
      // Safe fallback if a corrupt FEN is loaded
      chessInstance.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    }
    return chessInstance
  }

  /**
   * Returns the clean, default starting state of a chess game.
   */
  static getInitialState() {
    const freshChess = new Chess()
    return {
      fen: freshChess.fen(),
      turn: "w" as "w" | "b",
      history: [] as string[],
      status: {
        isGameOver: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: false,
        isCheck: false,
        turn: "w" as "w" | "b",
        winner: null as "w" | "b" | null,
      },
    }
  }

  /**
   * Derives game status indicators from the given FEN.
   */
  static getStatus(fen: string): GameStatus {
    const chess = this.sync(fen)
    const isCheckmate = chess.isCheckmate()
    const isStalemate = chess.isStalemate()
    const isDraw = chess.isDraw()
    const isGameOver = chess.isGameOver()
    const isCheck = chess.inCheck()
    const turn = chess.turn() as "w" | "b"

    let winner: "w" | "b" | null = null
    if (isCheckmate) {
      winner = turn === "w" ? "b" : "w"
    }

    return {
      isGameOver,
      isCheckmate,
      isStalemate,
      isDraw,
      isCheck,
      turn,
      winner,
    }
  }

  /**
   * Checks if a specific move requires pawn promotion.
   */
  static isPromotionMove(fen: string, from: string, to: string): boolean {
    const chess = this.sync(fen)
    try {
      const piece = chess.get(from as Square)
      if (!piece || piece.type !== "p") return false
      
      const toRank = to[1]
      return (piece.color === "w" && toRank === "8") || (piece.color === "b" && toRank === "1")
    } catch {
      return false
    }
  }

  /**
   * Executes a move on the given FEN and returns the updated state.
   */
  static makeMove(
    fen: string,
    from: string,
    to: string,
    promotion?: string
  ): {
    success: boolean
    fen: string
    san: string
    status: GameStatus
  } {
    const chess = this.sync(fen)
    try {
      const moveObj: any = { from, to }
      if (this.isPromotionMove(fen, from, to)) {
        moveObj.promotion = promotion || "q"
      }

      const result = chess.move(moveObj)
      const newFen = chess.fen()
      const status = this.getStatus(newFen)

      return {
        success: true,
        fen: newFen,
        san: result.san,
        status,
      }
    } catch {
      // Returns unchanged state on illegal moves
      return {
        success: false,
        fen,
        san: "",
        status: this.getStatus(fen),
      }
    }
  }

  /**
   * Generates all legal moves for a specific square based on the given FEN.
   */
  static getPossibleMoves(fen: string, square: string): { from: string; to: string; promotion?: string }[] {
    const chess = this.sync(fen)
    try {
      const verboseMoves = chess.moves({
        square: square as Square,
        verbose: true,
      })
      return verboseMoves.map((m: any) => ({
        from: m.from,
        to: m.to,
        promotion: m.promotion,
      }))
    } catch {
      return []
    }
  }

  /**
   * Rebuilds the board state sequentially from a history list.
   * Ensures clean history rehydration and absolute protection against state corruptions.
   */
  static rebuildStateFromHistory(moves: string[]): {
    fen: string
    turn: "w" | "b"
    status: GameStatus
  } {
    const chess = new Chess()
    for (const move of moves) {
      try {
        chess.move(move)
      } catch {
        break // Stop on any corrupt move string
      }
    }
    const fen = chess.fen()
    const status = this.getStatus(fen)
    return {
      fen,
      turn: chess.turn() as "w" | "b",
      status,
    }
  }
}
