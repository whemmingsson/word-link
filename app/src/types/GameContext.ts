import type { ZoomController } from "../canvas/zoomController.ts";
import type { PlacedLetter } from "./PlacedLetter";

export interface GameContext {
  draggedLetter: PlacedLetter | null;
  dragSource?: "grid" | "bar";
  cellSize: number;
  gridTextSize: number;
  letterTileTextSize: number;
  letterTileScoreTextSize: number;
  switchLetters?: boolean;
  wildcard?: {
    letter: PlacedLetter;
    selecting: boolean;
  };
  EXPERIMENTAL: {
    zoomEnabled: boolean;
  };
  zoomController?: ZoomController;
}
