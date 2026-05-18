import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ChessEngine } from "../engine/chess-engine"

// Initialize a single global engine instance for state manipulation
const engine = new ChessEngine()

export interface GameState {
  fen: string
  history: string[]
  isHydrated: boolean
  turn: "w" | "b"
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  winner: "w" | "b" | null
  
  // Actions
  makeMove: (from: string, to: string, promotion?: string) => boolean
  undoMove: () => void
  resetGame: () => void
  setHydrated: (hydrated: boolean) => void
  getPossibleMoves: (square: string) => { from: string; to: string; promotion?: string }[]
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      history: [],
      isHydrated: false,
      turn: "w",
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      winner: null,

      makeMove: (from: string, to: string, promotion?: string) => {
        const state = get()
        // Synchronize engine to store's current FEN
        engine.loadFen(state.fen)
        const result = engine.makeMove({ from, to, promotion })
        
        if (result.success) {
          const status = engine.getStatus()
          const newMoveSan = result.moveDetails?.san || ""
          const newHistory = [...state.history, newMoveSan]
          set({
            fen: result.fen,
            history: newHistory,
            turn: status.turn,
            isCheck: status.isCheck,
            isCheckmate: status.isCheckmate,
            isStalemate: status.isStalemate,
            isDraw: status.isDraw,
            winner: status.winner,
          })
          return true
        }
        return false
      },

      undoMove: () => {
        const state = get()
        engine.loadFen(state.fen)
        const result = engine.undoMove()
        
        if (result.success) {
          const status = engine.getStatus()
          set({
            fen: result.fen,
            history: state.history.slice(0, -1),
            turn: status.turn,
            isCheck: status.isCheck,
            isCheckmate: status.isCheckmate,
            isStalemate: status.isStalemate,
            isDraw: status.isDraw,
            winner: status.winner,
          })
        }
      },

      resetGame: () => {
        const startFen = engine.reset()
        const status = engine.getStatus()
        set({
          fen: startFen,
          history: [],
          turn: "w",
          isCheck: false,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
          winner: null,
        })
      },

      getPossibleMoves: (square: string) => {
        const state = get()
        engine.loadFen(state.fen)
        const verboseMoves = engine.getVerboseMoves(square)
        return verboseMoves.map((m: any) => ({
          from: m.from,
          to: m.to,
          promotion: m.promotion,
        }))
      },

      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: "chess-magic-game-state",
      storage: createJSONStorage(() => localStorage),
      // Set hydration marker when loaded on client
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        }
      },
    }
  )
)
