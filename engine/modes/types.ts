export interface GameStatus {
  isGameOver: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isCheck: boolean
  turn: "w" | "b"
  winner: "w" | "b" | null
}

export interface GameMode {
  id: string
  name: string
  description: string
  icon: string // Lucide icon identifier
  
  /**
   * Returns the starting FEN for this mode.
   */
  setupBoard(): string

  /**
   * Returns the initial mode-specific chaos state.
   */
  getInitialState(): any

  /**
   * Pre-move hook. Allows the mode to reject a move before chess.js processes it.
   */
  onMoveValidate(
    fen: string,
    from: string,
    to: string,
    chaosState: any
  ): { valid: boolean; reason?: string }

  /**
   * Move execution hook. Processes the move and updates FEN and mode state.
   */
  onMoveExecute(
    fen: string,
    from: string,
    to: string,
    promotion: string | undefined,
    chaosState: any
  ): {
    success: boolean
    fen: string
    san: string
    chaosState: any
    status: GameStatus
  }

  /**
   * Custom possible moves generator filter.
   */
  filterPossibleMoves(
    fen: string,
    square: string,
    moves: { from: string; to: string; promotion?: string }[],
    chaosState: any
  ): { from: string; to: string; promotion?: string }[]

  /**
   * Hook that executes at the end of each turn.
   */
  onTurnEnd?(
    fen: string,
    chaosState: any,
    turn: "w" | "b"
  ): { fen: string; chaosState: any }
}

export interface Spell {
  id: string
  name: string
  description: string
  manaCost: number
  cooldown: number // Cooldown duration in turns
  icon: string // Lucide icon identifier

  /**
   * Validates if a spell can be cast on the target.
   */
  validateCast(
    fen: string,
    targetSquare: string,
    casterColor: "w" | "b",
    chaosState: any
  ): { valid: boolean; reason?: string }

  /**
   * Executes the spell effect, mutating the board and state.
   */
  cast(
    fen: string,
    targetSquare: string,
    casterColor: "w" | "b",
    chaosState: any
  ): {
    success: boolean
    fen: string
    chaosState: any
    message?: string
  }
}
