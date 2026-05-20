import { GameMode, GameStatus, Spell } from "./types"
import { ChessEngineService } from "../chess-engine"
import { Chess, Square } from "chess.js"

export interface SpellChessState {
  mana: { w: number; b: number }
  cooldowns: {
    w: Record<string, number>
    b: Record<string, number>
  }
  frozenSquares: Record<string, number> // square -> turns remaining
  shieldedSquares: Record<string, boolean> // square -> isShielded
}

// Helper to toggle FEN turn manually when a move is intercepted / custom
function toggleFenTurn(fen: string): string {
  const parts = fen.split(" ")
  if (parts.length > 1) {
    parts[1] = parts[1] === "w" ? "b" : "w"
  }
  if (parts.length > 3) {
    parts[3] = "-" // Clear en passant square target when switching turn via a spell
  }
  return parts.join(" ")
}

// ── FIREBALL SPELL ──────────────────────────────────────────────────────────
export class FireballSpell implements Spell {
  id = "fireball"
  name = "Fireball"
  description = "Incinerates a target non-king piece. If the target is shielded, the shield breaks instead."
  manaCost = 40
  cooldown = 3
  icon = "flame"

  validateCast(fen: string, targetSquare: string, casterColor: "w" | "b", chaosState: SpellChessState) {
    const chess = new Chess(fen)
    const piece = chess.get(targetSquare as Square)
    
    if (!piece) {
      return { valid: false, reason: "Must target a square with a piece." }
    }
    
    if (piece.type === "k") {
      return { valid: false, reason: "Cannot target Kings with Fireball!" }
    }

    if (chaosState.frozenSquares[targetSquare] > 0) {
      return { valid: false, reason: "Cannot target a frozen piece in stasis." }
    }

    return { valid: true }
  }

  cast(fen: string, targetSquare: string, casterColor: "w" | "b", chaosState: SpellChessState) {
    const nextState = { ...chaosState }
    
    // Check if target is shielded
    if (nextState.shieldedSquares[targetSquare]) {
      // Consume shield instead of destroying piece
      nextState.shieldedSquares[targetSquare] = false
      return {
        success: true,
        fen,
        chaosState: nextState,
        message: `Fireball cast on ${targetSquare.toUpperCase()}! The Shield absorbed the blast.`
      }
    }

    // Destroy piece
    const chess = new Chess(fen)
    chess.remove(targetSquare as Square)
    const newFen = toggleFenTurn(chess.fen()) // Casting a spell switches the turn

    return {
      success: true,
      fen: newFen,
      chaosState: nextState,
      message: `Fireball cast on ${targetSquare.toUpperCase()}! Piece vaporized.`
    }
  }
}

// ── FREEZE SPELL ────────────────────────────────────────────────────────────
export class FreezeSpell implements Spell {
  id = "freeze"
  name = "Freeze"
  description = "Locks any piece in ice for 2 turns. It cannot move or be captured."
  manaCost = 30
  cooldown = 2
  icon = "snowflake"

  validateCast(fen: string, targetSquare: string, casterColor: "w" | "b", chaosState: SpellChessState) {
    const chess = new Chess(fen)
    const piece = chess.get(targetSquare as Square)
    
    if (!piece) {
      return { valid: false, reason: "Must target a square with a piece." }
    }

    if (piece.type === "k") {
      return { valid: false, reason: "Cannot freeze Kings!" }
    }

    return { valid: true }
  }

  cast(fen: string, targetSquare: string, casterColor: "w" | "b", chaosState: SpellChessState) {
    const nextState = { ...chaosState }
    
    // Set freeze timer for 2 turns (lasts through caster's and opponent's turn)
    nextState.frozenSquares[targetSquare] = 2

    // Freeze also clears shields
    nextState.shieldedSquares[targetSquare] = false

    const newFen = toggleFenTurn(fen) // Casting a spell switches the turn

    return {
      success: true,
      fen: newFen,
      chaosState: nextState,
      message: `Freeze cast on ${targetSquare.toUpperCase()}! Piece locked in ice.`
    }
  }
}

// ── SHIELD SPELL ─────────────────────────────────────────────────────────────
export class ShieldSpell implements Spell {
  id = "shield"
  name = "Shield"
  description = "Shields a friendly piece. If captured, the shield is consumed and the capturing piece is vaporized."
  manaCost = 30
  cooldown = 2
  icon = "shield"

  validateCast(fen: string, targetSquare: string, casterColor: "w" | "b", chaosState: SpellChessState) {
    const chess = new Chess(fen)
    const piece = chess.get(targetSquare as Square)
    
    if (!piece) {
      return { valid: false, reason: "Must target a friendly piece." }
    }

    const friendlyColor = casterColor === "w" ? "w" : "b"
    if (piece.color !== friendlyColor) {
      return { valid: false, reason: "Must target your own piece." }
    }

    if (chaosState.frozenSquares[targetSquare] > 0) {
      return { valid: false, reason: "Cannot shield a frozen piece." }
    }

    if (chaosState.shieldedSquares[targetSquare]) {
      return { valid: false, reason: "Piece is already shielded!" }
    }

    return { valid: true }
  }

  cast(fen: string, targetSquare: string, casterColor: "w" | "b", chaosState: SpellChessState) {
    const nextState = { ...chaosState }
    nextState.shieldedSquares[targetSquare] = true

    const newFen = toggleFenTurn(fen) // Casting a spell switches turn

    return {
      success: true,
      fen: newFen,
      chaosState: nextState,
      message: `Shield cast on ${targetSquare.toUpperCase()}!`
    }
  }
}

// ── SPELL CHESS MODE ─────────────────────────────────────────────────────────
export class SpellMode implements GameMode {
  id = "spell"
  name = "Spell Chess"
  description = "Unleash magic spells (Fireball, Freeze, Shield) using mana. Spells consume your turn."
  icon = "zap"

  spells: Spell[] = [
    new FireballSpell(),
    new FreezeSpell(),
    new ShieldSpell()
  ]

  setupBoard(): string {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }

  getInitialState(): SpellChessState {
    return {
      mana: { w: 30, b: 30 },
      cooldowns: {
        w: { fireball: 0, freeze: 0, shield: 0 },
        b: { fireball: 0, freeze: 0, shield: 0 }
      },
      frozenSquares: {},
      shieldedSquares: {}
    }
  }

  onMoveValidate(
    fen: string,
    from: string,
    to: string,
    chaosState: SpellChessState
  ): { valid: boolean; reason?: string } {
    // 1. Check if piece to move is frozen
    if (chaosState.frozenSquares[from] > 0) {
      return { valid: false, reason: "Piece is frozen in ice!" }
    }

    // 2. Check if target piece is frozen
    if (chaosState.frozenSquares[to] > 0) {
      return { valid: false, reason: "Target piece is frozen and immune to capture!" }
    }

    return { valid: true }
  }

  onMoveExecute(
    fen: string,
    from: string,
    to: string,
    promotion: string | undefined,
    chaosState: SpellChessState
  ) {
    const nextState = { ...chaosState }
    
    // Check if capturing a shielded piece
    if (nextState.shieldedSquares[to]) {
      // CAPTURE SHIELD INTERCEPT:
      // Capturer gets vaporized, shielded piece survives, shield is consumed, turn changes!
      const chess = new Chess(fen)
      
      // Determine capturing piece representation to build custom history log
      const capturingPiece = chess.get(from as Square)
      const capturingPieceName = capturingPiece ? capturingPiece.type.toUpperCase() : "Piece"
      
      // Vaporize capturer at 'from' square
      chess.remove(from as Square)
      
      // Consume shield at 'to' square
      nextState.shieldedSquares[to] = false
      
      // Manually toggle turn in FEN
      const nextFen = toggleFenTurn(chess.fen())
      const status = ChessEngineService.getStatus(nextFen)
      
      return {
        success: true,
        fen: nextFen,
        san: `${capturingPieceName}x${to}[Shatter]`,
        chaosState: nextState,
        status
      }
    }

    // Standard Move Execution
    const result = ChessEngineService.makeMove(fen, from, to, promotion)
    
    if (result.success) {
      // If a shielded piece moves, the shield moves with it!
      if (nextState.shieldedSquares[from]) {
        nextState.shieldedSquares[to] = true
        delete nextState.shieldedSquares[from]
      }
    }

    return {
      success: result.success,
      fen: result.fen,
      san: result.san,
      chaosState: nextState,
      status: result.status
    }
  }

  filterPossibleMoves(
    fen: string,
    square: string,
    moves: { from: string; to: string; promotion?: string }[],
    chaosState: SpellChessState
  ): { from: string; to: string; promotion?: string }[] {
    // 1. If the piece on the square is frozen, it has zero moves
    if (chaosState.frozenSquares[square] > 0) {
      return []
    }

    // 2. Filter out moves that capture a frozen piece
    return moves.filter((m) => {
      const targetFreeze = chaosState.frozenSquares[m.to]
      return !(targetFreeze && targetFreeze > 0)
    })
  }

  onTurnEnd(
    fen: string,
    chaosState: SpellChessState,
    completedTurn: "w" | "b"
  ): { fen: string; chaosState: SpellChessState } {
    const nextState = { ...chaosState }
    
    // Decrement freeze timers
    const nextFrozen: Record<string, number> = {}
    Object.entries(nextState.frozenSquares).forEach(([sq, turns]) => {
      if (turns > 1) {
        nextFrozen[sq] = turns - 1
      }
    })
    nextState.frozenSquares = nextFrozen

    // Decrement cooldowns for the player who just finished their turn
    const playerCooldowns = nextState.cooldowns[completedTurn]
    Object.keys(playerCooldowns).forEach((spellId) => {
      if (playerCooldowns[spellId] > 0) {
        playerCooldowns[spellId] -= 1
      }
    })

    // Increase mana for the next player (whose turn is starting now!)
    const nextPlayer: "w" | "b" = completedTurn === "w" ? "b" : "w"
    const currentMana = nextState.mana[nextPlayer]
    nextState.mana[nextPlayer] = Math.min(100, currentMana + 15)

    return { fen, chaosState: nextState }
  }
}
