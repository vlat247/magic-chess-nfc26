/**
 * Move validation layer for multiplayer.
 * All incoming opponent moves MUST pass through here before state is applied.
 * Uses chess.js — identical to ChessEngineService but focused on multiplayer safety.
 */

import { Chess, Square } from 'chess.js'

export interface ValidatedMove {
  valid: boolean
  newFen: string
  san: string
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isCheck: boolean
  turn: 'w' | 'b'
  winner: 'white' | 'black' | null
}

/** Validates and applies an opponent's broadcast move against the current FEN */
export function validateAndApplyMove(
  currentFen: string,
  from: string,
  to: string,
  promotion?: string
): ValidatedMove {
  const chess = new Chess()

  try {
    chess.load(currentFen)
  } catch {
    return { valid: false, newFen: currentFen, san: '', isCheckmate: false, isStalemate: false, isDraw: false, isCheck: false, turn: 'w', winner: null }
  }

  try {
    const moveObj: { from: string; to: string; promotion?: string } = { from, to }

    // Auto-detect promotion
    const piece = chess.get(from as Square)
    if (piece?.type === 'p') {
      const toRank = to[1]
      if ((piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1')) {
        moveObj.promotion = promotion ?? 'q'
      }
    }

    const result = chess.move(moveObj)
    const newFen = chess.fen()
    const isCheckmate = chess.isCheckmate()
    const isStalemate = chess.isStalemate()
    const isDraw = chess.isDraw()
    const isCheck = chess.inCheck()
    const turn = chess.turn() as 'w' | 'b'

    let winner: 'white' | 'black' | null = null
    if (isCheckmate) {
      winner = turn === 'w' ? 'black' : 'white'
    }

    return {
      valid: true,
      newFen,
      san: result.san,
      isCheckmate,
      isStalemate,
      isDraw,
      isCheck,
      turn,
      winner,
    }
  } catch {
    // Illegal move from opponent — trigger desync recovery
    return {
      valid: false,
      newFen: currentFen,
      san: '',
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      isCheck: false,
      turn: 'w',
      winner: null,
    }
  }
}

/** Rebuilds FEN from an array of SAN moves — used for reconnection reconciliation */
export function reconstructFromHistory(pgnHistory: string[]): {
  fen: string
  turn: 'w' | 'b'
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  moveSeq: number
} {
  const chess = new Chess()

  for (const san of pgnHistory) {
    try {
      chess.move(san)
    } catch {
      break // Stop on corrupt move
    }
  }

  return {
    fen: chess.fen(),
    turn: chess.turn() as 'w' | 'b',
    isCheckmate: chess.isCheckmate(),
    isStalemate: chess.isStalemate(),
    isDraw: chess.isDraw(),
    moveSeq: pgnHistory.length,
  }
}

/** Returns true if it is the given color's turn in the current FEN */
export function isPlayersTurn(fen: string, playerColor: 'white' | 'black'): boolean {
  try {
    const chess = new Chess()
    chess.load(fen)
    const turn = chess.turn() // 'w' | 'b'
    return (playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b')
  } catch {
    return false
  }
}

/** Checks if the game is over given a FEN */
export function isGameOver(fen: string): { over: boolean; reason: string; winner: 'white' | 'black' | 'draw' | null } {
  try {
    const chess = new Chess()
    chess.load(fen)

    if (chess.isCheckmate()) {
      const loserTurn = chess.turn()
      return {
        over: true,
        reason: 'checkmate',
        winner: loserTurn === 'w' ? 'black' : 'white',
      }
    }
    if (chess.isStalemate()) return { over: true, reason: 'stalemate', winner: 'draw' }
    if (chess.isDraw()) return { over: true, reason: 'draw', winner: 'draw' }
    return { over: false, reason: '', winner: null }
  } catch {
    return { over: false, reason: '', winner: null }
  }
}
