import { GameMode } from "./types"
import { ClassicMode } from "./classic-mode"
import { SpellMode } from "./spell-mode"
import { KnightsOnlyMode } from "./knights-only-mode"

const registry: Record<string, GameMode> = {
  classic: new ClassicMode(),
  spell: new SpellMode(),
  knights_only: new KnightsOnlyMode(),
}

/**
 * Gets a game mode implementation by its ID. Falls back to Classic mode.
 */
export function getGameMode(id: string): GameMode {
  return registry[id] || registry.classic
}

/**
 * Returns all registered game modes.
 */
export function getAllGameModes(): GameMode[] {
  return Object.values(registry)
}
export type GameModeId = "classic" | "spell" | "knights_only"
