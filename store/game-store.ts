import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ChessEngineService } from "../engine/chess-engine"
import { getGameMode, GameModeId } from "../engine/modes/registry"

export interface GameState {
  // Core Game State
  fen: string
  history: string[]
  isHydrated: boolean
  turn: "w" | "b"
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  winner: "w" | "b" | null
  
  // Game Mode State
  gameModeId: GameModeId
  chaosState: any

  // AI State
  aiLevel: "easy" | "medium" | "hard" | "none"
  isThinking: boolean
  evaluation: number
  
  // Core Actions
  makeMove: (from: string, to: string, promotion?: string) => boolean
  undoMove: () => void
  resetGame: () => void
  setHydrated: (hydrated: boolean) => void
  getPossibleMoves: (square: string) => { from: string; to: string; promotion?: string }[]
  
  // Mode Selection & Casting Actions
  setGameMode: (modeId: GameModeId) => void
  castSpell: (spellId: string, targetSquare: string) => boolean

  // AI Actions
  setAiLevel: (level: "easy" | "medium" | "hard" | "none") => void
  setThinking: (thinking: boolean) => void
  setEvaluation: (evalScore: number) => void
}

const DEFAULT_MODE: GameModeId = "classic"
const defaultModeInstance = getGameMode(DEFAULT_MODE)
const initialFen = defaultModeInstance.setupBoard()
const initialChaosState = defaultModeInstance.getInitialState()
const initialStatus = ChessEngineService.getStatus(initialFen)

/**
 * Zustand Game Store for Chess & Magic.
 * Seamlessly integrates modular game mode behaviors, active visual states, and spell casting.
 */
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Default States
      fen: initialFen,
      history: [],
      isHydrated: false,
      turn: initialStatus.turn,
      isCheck: initialStatus.isCheck,
      isCheckmate: initialStatus.isCheckmate,
      isStalemate: initialStatus.isStalemate,
      isDraw: initialStatus.isDraw,
      winner: initialStatus.winner,
      
      gameModeId: DEFAULT_MODE,
      chaosState: initialChaosState,

      aiLevel: "none",
      isThinking: false,
      evaluation: 0,

      /**
       * Set the active game mode, reset the board, and set up state.
       */
      setGameMode: (modeId: GameModeId) => {
        const mode = getGameMode(modeId)
        const newFen = mode.setupBoard()
        const newChaos = mode.getInitialState()
        const status = ChessEngineService.getStatus(newFen)

        set({
          gameModeId: modeId,
          fen: newFen,
          chaosState: newChaos,
          history: [],
          turn: status.turn,
          isCheck: status.isCheck,
          isCheckmate: status.isCheckmate,
          isStalemate: status.isStalemate,
          isDraw: status.isDraw,
          winner: status.winner,
          isThinking: false,
          evaluation: 0,
        })
      },

      /**
       * Executes a standard move under the active game mode rules.
       */
      makeMove: (from: string, to: string, promotion?: string): boolean => {
        const state = get()
        const activeMode = getGameMode(state.gameModeId)

        // 1. Pre-validation hook
        const validation = activeMode.onMoveValidate(state.fen, from, to, state.chaosState)
        if (!validation.valid) {
          console.warn(`Move rejected by ${activeMode.name}: ${validation.reason}`)
          return false
        }

        // 2. Execute move hook (which triggers captures, shields, piece vaporization, etc.)
        const result = activeMode.onMoveExecute(state.fen, from, to, promotion, state.chaosState)
        
        if (result.success) {
          let postFen = result.fen
          let postChaos = result.chaosState

          // 3. Post-turn end hook (updates mana, freeze timers, decrements cooldowns)
          if (activeMode.onTurnEnd) {
            const turnEndResult = activeMode.onTurnEnd(postFen, postChaos, state.turn)
            postFen = turnEndResult.fen
            postChaos = turnEndResult.chaosState
          }

          const status = ChessEngineService.getStatus(postFen)

          set({
            fen: postFen,
            history: [...state.history, result.san],
            turn: status.turn,
            isCheck: status.isCheck,
            isCheckmate: status.isCheckmate,
            isStalemate: status.isStalemate,
            isDraw: status.isDraw,
            winner: status.winner,
            chaosState: postChaos,
          })
          return true
        }
        return false
      },

      /**
       * Casts a magical spell under the active mode's spell system.
       */
      castSpell: (spellId: string, targetSquare: string): boolean => {
        const state = get()
        const activeMode = getGameMode(state.gameModeId)
        
        // Only active in modes containing spells
        if (!("spells" in activeMode)) return false
        
        const spell = (activeMode as any).spells?.find((s: any) => s.id === spellId)
        if (!spell) return false

        // Check mana cost
        const casterMana = state.chaosState.mana[state.turn]
        if (casterMana < spell.manaCost) {
          console.warn("Insufficient mana to cast spell.")
          return false
        }

        // Check cooldown
        const currentCooldown = state.chaosState.cooldowns[state.turn]?.[spellId] || 0
        if (currentCooldown > 0) {
          console.warn("Spell is currently on cooldown.")
          return false
        }

        // Validate targeting
        const validation = spell.validateCast(state.fen, targetSquare, state.turn, state.chaosState)
        if (!validation.valid) {
          console.warn(`Spell cast rejected: ${validation.reason}`)
          return false
        }

        // Execute spell cast
        const result = spell.cast(state.fen, targetSquare, state.turn, state.chaosState)
        if (result.success) {
          let nextChaos = { ...result.chaosState }
          
          // Charge mana
          nextChaos.mana[state.turn] -= spell.manaCost
          
          // Initiate cooldown
          nextChaos.cooldowns[state.turn][spellId] = spell.cooldown

          // Post-turn end hook (run turn timers for the spellcaster)
          let postFen = result.fen
          if (activeMode.onTurnEnd) {
            const turnEndResult = activeMode.onTurnEnd(postFen, nextChaos, state.turn)
            postFen = turnEndResult.fen
            nextChaos = turnEndResult.chaosState
          }

          const status = ChessEngineService.getStatus(postFen)
          const spellLog = `✨ [${state.turn === "w" ? "White" : "Black"}] Cast ${spell.name} on ${targetSquare.toUpperCase()}`

          set({
            fen: postFen,
            history: [...state.history, spellLog],
            turn: status.turn,
            isCheck: status.isCheck,
            isCheckmate: status.isCheckmate,
            isStalemate: status.isStalemate,
            isDraw: status.isDraw,
            winner: status.winner,
            chaosState: nextChaos,
          })
          return true
        }
        return false
      },

      /**
       * State rollback via FEN history rebuild.
       */
      undoMove: () => {
        const state = get()
        if (state.history.length === 0) return

        const newHistory = state.history.slice(0, -1)
        const rolledBackState = ChessEngineService.rebuildStateFromHistory(newHistory)
        
        // Reset chaosState to clean initial values on undo to prevent sync failures
        const activeMode = getGameMode(state.gameModeId)
        const resetChaos = activeMode.getInitialState()

        set({
          fen: rolledBackState.fen,
          history: newHistory,
          turn: rolledBackState.turn,
          isCheck: rolledBackState.status.isCheck,
          isCheckmate: rolledBackState.status.isCheckmate,
          isStalemate: rolledBackState.status.isStalemate,
          isDraw: rolledBackState.status.isDraw,
          winner: rolledBackState.status.winner,
          chaosState: resetChaos,
        })
      },

      /**
       * Resets the game to starting coordinates under the active mode.
       */
      resetGame: () => {
        const state = get()
        const activeMode = getGameMode(state.gameModeId)
        const freshFen = activeMode.setupBoard()
        const freshChaos = activeMode.getInitialState()
        const status = ChessEngineService.getStatus(freshFen)

        set({
          fen: freshFen,
          history: [],
          turn: status.turn,
          isCheck: status.isCheck,
          isCheckmate: status.isCheckmate,
          isStalemate: status.isStalemate,
          isDraw: status.isDraw,
          winner: status.winner,
          chaosState: freshChaos,
          isThinking: false,
          evaluation: 0,
        })
      },

      /**
       * Returns valid moves, filtered by game-mode constraints.
       */
      getPossibleMoves: (square: string) => {
        const state = get()
        const rawMoves = ChessEngineService.getPossibleMoves(state.fen, square)
        const activeMode = getGameMode(state.gameModeId)
        return activeMode.filterPossibleMoves(state.fen, square, rawMoves, state.chaosState)
      },

      setAiLevel: (level) => set({ aiLevel: level }),
      setThinking: (thinking) => set({ isThinking: thinking }),
      setEvaluation: (evalScore) => set({ evaluation: evalScore }),
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: "chess-magic-game-state",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        }
      },
    }
  )
)
