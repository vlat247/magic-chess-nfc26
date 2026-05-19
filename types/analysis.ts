export type MoveQuality = 'book' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'missed_win';

export interface BestMoveInfo {
  from: string;
  to: string;
  san?: string;
  evaluation: number;
}

export interface MoveAnalysis {
  moveIndex: number;
  san: string;
  from: string;
  to: string;
  fenBefore: string;
  fenAfter: string;
  evaluation: number; // relative to White (positive is White advantage, negative is Black advantage)
  bestMove: BestMoveInfo;
  centipawnLoss: number;
  quality: MoveQuality;
  commentary: string | null;
}

export interface GameAnalysisReport {
  moves: MoveAnalysis[];
  accuracy: {
    white: number;
    black: number;
  };
  acpl: {
    white: number;
    black: number;
  };
  counts: {
    white: Record<MoveQuality, number>;
    black: Record<MoveQuality, number>;
  };
  summary: string | null;
}
