import { Chess, Square } from "chess.js"

export interface MoveInput {
  from: string
  to: string
  promotion?: string
}

export interface GameStatus {
  isGameOver: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isCheck: boolean
  turn: "w" | "b"
  winner: "w" | "b" | null
}

export class ChessEngine {
  private chess: Chess

  constructor(fen?: string) {
    this.chess = new Chess(fen)
  }

  // Get current FEN representation
  getFen(): string {
    return this.chess.fen()
  }

  // Get current active player turn ('w' or 'b')
  getTurn(): "w" | "b" {
    return this.chess.turn()
  }

  // Get legal algebraic moves for a specific square or entire board
  getLegalMoves(square?: string): string[] {
    if (square) {
      try {
        return this.chess.moves({ square: square as Square, verbose: false }) as string[]
      } catch {
        return []
      }
    }
    return this.chess.moves() as string[]
  }

  // Get detailed representation of legal moves from a square (useful for targets highlighting)
  getVerboseMoves(square?: string) {
    try {
      return this.chess.moves({
        square: square ? (square as Square) : undefined,
        verbose: true,
      })
    } catch {
      return []
    }
  }

  // Check if a move requires promotion choice
  isPromotionMove(from: string, to: string): boolean {
    try {
      const piece = this.chess.get(from as Square)
      if (!piece || piece.type !== "p") return false
      
      const toRank = to[1]
      return (piece.color === "w" && toRank === "8") || (piece.color === "b" && toRank === "1")
    } catch {
      return false
    }
  }

  // Attempt to execute a move on the board
  makeMove(move: MoveInput): { success: boolean; fen: string; moveDetails?: any } {
    try {
      const moveObj: any = {
        from: move.from,
        to: move.to,
      }

      // Automatically apply Queen promotion if it requires promotion and none specified
      if (this.isPromotionMove(move.from, move.to)) {
        moveObj.promotion = move.promotion || "q"
      }

      const result = this.chess.move(moveObj)
      return {
        success: true,
        fen: this.chess.fen(),
        moveDetails: result,
      }
    } catch (error) {
      return {
        success: false,
        fen: this.chess.fen(),
      }
    }
  }

  // Revert the last move played
  undoMove(): { success: boolean; fen: string } {
    const result = this.chess.undo()
    return {
      success: !!result,
      fen: this.chess.fen(),
    }
  }

  // Reset the game to the starting layout
  reset(): string {
    this.chess.reset()
    return this.chess.fen()
  }

  // Load a game from a custom FEN
  loadFen(fen: string): boolean {
    try {
      this.chess.load(fen)
      return true
    } catch {
      return false
    }
  }

  // Get details of a piece on a specific square
  getPiece(square: string) {
    try {
      return this.chess.get(square as Square)
    } catch {
      return null
    }
  }

  // Check complete game state metrics
  getStatus(): GameStatus {
    const isCheckmate = this.chess.isCheckmate()
    const isStalemate = this.chess.isStalemate()
    const isDraw = this.chess.isDraw()
    const isGameOver = this.chess.isGameOver()
    const isCheck = this.chess.inCheck()
    const turn = this.chess.turn()

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

  // Get the complete standard algebraic move list (e.g. ['e4', 'Nf3'])
  getHistory(): string[] {
    return this.chess.history()
  }

  // Get detailed verbose history (including piece types, captures, squares)
  getDetailedHistory() {
    return this.chess.history({ verbose: true })
  }
}
