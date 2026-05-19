import { useEffect, useRef } from "react"
import { useGameStore } from "@/store/game-store"
import { AIService } from "@/lib/engine/ai-service"

/**
 * Hook to manage AI integration with the game store.
 * Subscribes to AI Service and automatically executes moves when the AI responds.
 * Triggers the AI to think when it's the AI's turn.
 * Includes a robust fallback executor for Chaos Modes (such as Spell Chess).
 */
export function useChessAI() {
  const {
    fen,
    turn,
    aiLevel,
    isCheckmate,
    isDraw,
    makeMove,
    getPossibleMoves,
    setThinking,
    setEvaluation,
  } = useGameStore()

  const isAIMovePending = useRef(false)

  // Initialization & Subscription
  useEffect(() => {
    const unsubscribe = AIService.subscribe((msg) => {
      if (msg.isThinking !== undefined) {
        setThinking(msg.isThinking)
      }
      
      if (msg.evaluation !== undefined) {
        // Reverse evaluation if black to keep positive = white winning
        const score = msg.evaluation
        setEvaluation(score)
      }

      if (msg.bestMove && isAIMovePending.current) {
        isAIMovePending.current = false
        // bestMove is usually something like "e2e4" or "e7e8q"
        const from = msg.bestMove.substring(0, 2)
        const to = msg.bestMove.substring(2, 4)
        const promotion = msg.bestMove.length > 4 ? msg.bestMove[4] : undefined
        
        const success = makeMove(from, to, promotion)
        
        // ── CHAOS MODE SAFE FALLBACK ──────────────────────────────────────────
        if (!success) {
          console.warn(`AI proposed illegal/frozen move ${from}${to} in Chaos Mode! Playing safe fallback.`);
          
          // Generate a list of all board squares to scan for active possible moves
          const boardSquares = [
            "a8","b8","c8","d8","e8","f8","g8","h8",
            "a7","b7","c7","d7","e7","f7","g7","h7",
            "a6","b6","c6","d6","e6","f6","g6","h6",
            "a5","b5","c5","d5","e5","f5","g5","h5",
            "a4","b4","c4","d4","e4","f4","g4","h4",
            "a3","b3","c3","d3","e3","f3","g3","h3",
            "a2","b2","c2","d2","e2","f2","g2","h2",
            "a1","b1","c1","d1","e1","f1","g1","h1"
          ];

          let fallbackFound = false;

          for (const sq of boardSquares) {
            const allowedMoves = getPossibleMoves(sq);
            if (allowedMoves.length > 0) {
              for (const move of allowedMoves) {
                const retrySuccess = makeMove(move.from, move.to, move.promotion);
                if (retrySuccess) {
                  console.log(`Executed AI Chaos-Fallback move: ${move.from} to ${move.to}`);
                  fallbackFound = true;
                  break;
                }
              }
            }
            if (fallbackFound) break;
          }

          if (!fallbackFound) {
            console.error("AI has no legal fallback moves. Game might be locked or over.");
          }
        }
      }
    })

    return () => {
      unsubscribe()
      AIService.stop()
    }
  }, [makeMove, getPossibleMoves, setThinking, setEvaluation])

  // Trigger AI to think when it is its turn
  useEffect(() => {
    if (aiLevel === "none" || isCheckmate || isDraw) {
      return
    }

    const isAITurn = turn === "b"

    if (isAITurn && !isAIMovePending.current) {
      isAIMovePending.current = true
      AIService.getBestMove(fen, aiLevel)
    } else if (!isAITurn) {
      // Background evaluation for user position
      AIService.evaluatePosition(fen)
    }
  }, [fen, turn, aiLevel, isCheckmate, isDraw])
}
