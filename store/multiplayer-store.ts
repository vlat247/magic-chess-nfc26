/**
 * Zustand store for multiplayer game state.
 *
 * Intentionally NOT persisted — reconnection uses the DB as source of truth.
 * The store is reset between games and populated by use-multiplayer-room hook.
 */

import { create } from 'zustand'

export type PlayerColor = 'white' | 'black'
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
export type OpponentStatus = 'online' | 'offline' | 'reconnecting'
export type GamePhase = 'lobby' | 'waiting' | 'active' | 'finished'

export interface MultiplayerState {
  // Room identity
  roomId: string | null
  playerColor: PlayerColor | null
  opponentId: string | null
  opponentUsername: string | null

  // Connection
  connectionStatus: ConnectionStatus
  opponentStatus: OpponentStatus

  // Game state (synchronized view)
  fen: string
  pgnHistory: string[]
  moveSeq: number
  turn: 'w' | 'b'
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  winner: string | null
  gamePhase: GamePhase

  // Timers (seconds remaining)
  timeWhite: number
  timeBlack: number
  timeControl: number

  // Loading & error
  isLoading: boolean
  error: string | null

  // Actions
  setRoom: (roomId: string) => void
  setPlayerColor: (color: PlayerColor) => void
  setOpponent: (id: string, username: string) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setOpponentStatus: (status: OpponentStatus) => void
  applyMove: (params: {
    fen: string
    san: string
    seq: number
    isCheck: boolean
    isCheckmate: boolean
    isStalemate: boolean
    isDraw: boolean
    winner: string | null
    turn: 'w' | 'b'
  }) => void
  setTimers: (timeWhite: number, timeBlack: number) => void
  setGamePhase: (phase: GamePhase) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetRoom: () => void
  hydrateFromRoom: (params: {
    fen: string
    pgnHistory: string[]
    moveSeq: number
    turn: 'w' | 'b'
    timeWhite: number
    timeBlack: number
    timeControl: number
    isCheckmate: boolean
    isStalemate: boolean
    isDraw: boolean
  }) => void
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export const useMultiplayerStore = create<MultiplayerState>()((set) => ({
  // Room identity
  roomId: null,
  playerColor: null,
  opponentId: null,
  opponentUsername: null,

  // Connection
  connectionStatus: 'idle',
  opponentStatus: 'online',

  // Game state
  fen: INITIAL_FEN,
  pgnHistory: [],
  moveSeq: 0,
  turn: 'w',
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  isDraw: false,
  winner: null,
  gamePhase: 'lobby',

  // Timers
  timeWhite: 600,
  timeBlack: 600,
  timeControl: 600,

  // Loading
  isLoading: false,
  error: null,

  // Actions
  setRoom: (roomId) => set({ roomId }),

  setPlayerColor: (color) => set({ playerColor: color }),

  setOpponent: (id, username) =>
    set({ opponentId: id, opponentUsername: username }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setOpponentStatus: (status) => set({ opponentStatus: status }),

  applyMove: ({ fen, san, seq, isCheck, isCheckmate, isStalemate, isDraw, winner, turn }) =>
    set((state) => ({
      fen,
      pgnHistory: [...state.pgnHistory, san],
      moveSeq: seq,
      isCheck,
      isCheckmate,
      isStalemate,
      isDraw,
      winner,
      turn,
      gamePhase: (isCheckmate || isStalemate || isDraw) ? 'finished' : 'active',
    })),

  setTimers: (timeWhite, timeBlack) => set({ timeWhite, timeBlack }),

  setGamePhase: (phase) => set({ gamePhase: phase }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  hydrateFromRoom: ({ fen, pgnHistory, moveSeq, turn, timeWhite, timeBlack, timeControl, isCheckmate, isStalemate, isDraw }) =>
    set({
      fen,
      pgnHistory,
      moveSeq,
      turn,
      timeWhite,
      timeBlack,
      timeControl,
      isCheckmate,
      isStalemate,
      isDraw,
      gamePhase: (isCheckmate || isStalemate || isDraw) ? 'finished' : 'active',
    }),

  resetRoom: () =>
    set({
      roomId: null,
      playerColor: null,
      opponentId: null,
      opponentUsername: null,
      connectionStatus: 'idle',
      opponentStatus: 'online',
      fen: INITIAL_FEN,
      pgnHistory: [],
      moveSeq: 0,
      turn: 'w',
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      winner: null,
      gamePhase: 'lobby',
      timeWhite: 600,
      timeBlack: 600,
      isLoading: false,
      error: null,
    }),
}))
