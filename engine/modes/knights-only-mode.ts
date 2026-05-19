import { GameMode } from "./types"
import { ChessEngineService } from "../chess-engine"

export class KnightsOnlyMode implements GameMode {
  id = "knights_only"
  name = "Knights Clash"
  description = "All pawns and major pieces have vanished. The battlefield belongs purely to the Knights."
  icon = "shield-alert"

  setupBoard(): string {
    // Starting FEN with only Kings and Knights
    // n1n1k1n1/nnnnnnnn/8/8/8/8/NNNNNNNN/N1N1K1N1 w - - 0 1
    return "n1n1k1n1/nnnnnnnn/8/8/8/8/NNNNNNNN/N1N1K1N1 w - - 0 1"
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
