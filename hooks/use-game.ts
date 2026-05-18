import { useGameStore } from "../store/game-store"

export function useGame() {
  return useGameStore()
}
