import { GameMode } from "./types"
import { ChessEngineService } from "../chess-engine"

export class ClassicMode implements GameMode {
  id = "classic"
  name = "Classic Chess"
  description = "Pure, unadulterated chess under traditional rules."
  icon = "swords"

  setupBoard(): string {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }

  getInitialState(): any {
    return {}
  }

  onMoveValidate(
    fen: string,
    from: string,
    to: string,
    chaosState: any
  ): { valid: boolean; reason?: string } {
    return { valid: true }
  }

  onMoveExecute(
    fen: string,
    from: string,
    to: string,
    promotion: string | undefined,
    chaosState: any
  ) {
    const result = ChessEngineService.makeMove(fen, from, to, promotion)
    return {
      success: result.success,
      fen: result.fen,
      san: result.san,
      chaosState,
      status: result.status,
    }
  }

  filterPossibleMoves(
    fen: string,
    square: string,
    moves: { from: string; to: string; promotion?: string }[],
    chaosState: any
  ): { from: string; to: string; promotion?: string }[] {
    return moves
  }
}
