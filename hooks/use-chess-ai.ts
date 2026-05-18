import { useEffect, useRef } from "react"
import { useGameStore } from "@/store/game-store"
import { AIService } from "@/lib/engine/ai-service"

/**
 * Hook to manage AI integration with the game store.
 * Subscribes to AI Service and automatically executes moves when the AI responds.
 * Triggers the AI to think when it's the AI's turn.
 */
export function useChessAI() {
  const {
    fen,
    turn,
    aiLevel,
    isCheckmate,
    isDraw,
    makeMove,
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
        
        makeMove(from, to, promotion)
      }
    })

    return () => {
      unsubscribe()
      AIService.stop()
    }
  }, [makeMove, setThinking, setEvaluation])

  // Trigger AI to think when it is its turn
  useEffect(() => {
    if (aiLevel === "none" || isCheckmate || isDraw) {
      return
    }

    // Default behavior: Player is White, AI is Black
    // If you want to support playing as Black, we'd need a `playerColor` state.
    // For now, AI is always Black.
    const isAITurn = turn === "b"

    if (isAITurn && !isAIMovePending.current) {
      isAIMovePending.current = true
      AIService.getBestMove(fen, aiLevel)
    } else if (!isAITurn) {
      // It's the player's turn, we can evaluate the position in the background
      AIService.evaluatePosition(fen)
    }
  }, [fen, turn, aiLevel, isCheckmate, isDraw])
}
