import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ChessEngineService } from "../engine/chess-engine"

export interface GameState {
  // Serializable State Only
  fen: string
  history: string[]
  isHydrated: boolean
  turn: "w" | "b"
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  winner: "w" | "b" | null
  
  // AI State (Not persisted fully since we want to reset UI state on reload)
  aiLevel: "easy" | "medium" | "hard" | "none"
  isThinking: boolean
  evaluation: number
  
  // Actions
  makeMove: (from: string, to: string, promotion?: string) => boolean
  undoMove: () => void
  resetGame: () => void
  setHydrated: (hydrated: boolean) => void
  getPossibleMoves: (square: string) => { from: string; to: string; promotion?: string }[]
  
  setAiLevel: (level: "easy" | "medium" | "hard" | "none") => void
  setThinking: (thinking: boolean) => void
  setEvaluation: (evalScore: number) => void
}

const initialState = ChessEngineService.getInitialState()

/**
 * Performant & Serializable Zustand game store for Chess & Magic.
 * Houses only JSON-serializable UI state, keeping it completely safe from Next.js hydration crashes
 * and fully prepared for multiplayer synchronization, Chaos grids, and fast state rollbacks.
 */
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Default States
      fen: initialState.fen,
      history: initialState.history,
      isHydrated: false,
      turn: initialState.turn,
      isCheck: initialState.status.isCheck,
      isCheckmate: initialState.status.isCheckmate,
      isStalemate: initialState.status.isStalemate,
      isDraw: initialState.status.isDraw,
      winner: initialState.status.winner,
      
      aiLevel: "none",
      isThinking: false,
      evaluation: 0,

      /**
       * Executes a move, updates serializable state on success, and triggers alerts.
       */
      makeMove: (from: string, to: string, promotion?: string): boolean => {
        const state = get()
        const result = ChessEngineService.makeMove(state.fen, from, to, promotion)
        
        if (result.success) {
          set({
            fen: result.fen,
            history: [...state.history, result.san],
            turn: result.status.turn,
            isCheck: result.status.isCheck,
            isCheckmate: result.status.isCheckmate,
            isStalemate: result.status.isStalemate,
            isDraw: result.status.isDraw,
            winner: result.status.winner,
          })
          return true
        }
        return false
      },

      /**
       * Performs a highly stable state rollback by rebuilding FEN position from history.
       * Eliminates accidental state corruptions during undos.
       */
      undoMove: () => {
        const state = get()
        if (state.history.length === 0) return

        const newHistory = state.history.slice(0, -1)
        const rolledBackState = ChessEngineService.rebuildStateFromHistory(newHistory)

        set({
          fen: rolledBackState.fen,
          history: newHistory,
          turn: rolledBackState.turn,
          isCheck: rolledBackState.status.isCheck,
          isCheckmate: rolledBackState.status.isCheckmate,
          isStalemate: rolledBackState.status.isStalemate,
          isDraw: rolledBackState.status.isDraw,
          winner: rolledBackState.status.winner,
        })
      },

      /**
       * Cleanly resets the game to standard starting coordinates.
       */
      resetGame: () => {
        set({
          fen: initialState.fen,
          history: initialState.history,
          turn: initialState.turn,
          isCheck: initialState.status.isCheck,
          isCheckmate: initialState.status.isCheckmate,
          isStalemate: initialState.status.isStalemate,
          isDraw: initialState.status.isDraw,
          winner: initialState.status.winner,
        })
      },

      /**
       * Returns all valid moves for a selected square in a lightweight coordinates format.
       */
      getPossibleMoves: (square: string) => {
        const state = get()
        return ChessEngineService.getPossibleMoves(state.fen, square)
      },

      setAiLevel: (level) => set({ aiLevel: level }),
      setThinking: (thinking) => set({ isThinking: thinking }),
      setEvaluation: (evalScore) => set({ evaluation: evalScore }),

      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: "chess-magic-game-state",
      storage: createJSONStorage(() => localStorage),
      // Mark client hydration complete once localStorage is merged
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        }
      },
    }
  )
)
