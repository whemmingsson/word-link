import type { ZoomController } from "../canvas/zoomController.ts";
import type { Letter } from "./Letter.ts";

export interface GameContext {
  draggedLetter: Letter | null;
  dragSource?: "grid" | "bar";
  cellSize: number;
  gridTextSize: number;
  letterTileTextSize: number;
  letterTileScoreTextSize: number;
  switchLetters?: boolean;
  wildcard?: {
    letter: Letter;
    selecting: boolean;
  };
  EXPERIMENTAL: {
    zoomEnabled: boolean;
  };
  zoomController?: ZoomController;
}
