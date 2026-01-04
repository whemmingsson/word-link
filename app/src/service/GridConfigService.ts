import { makeTileMap } from "../config/tileConfig";
import { BoardCell } from "../types/tile";

const letterMultiplierMap: Map<BoardCell, number> = new Map();
letterMultiplierMap.set(BoardCell.Empty, 1);
letterMultiplierMap.set(BoardCell.DoubleLetter, 2);
letterMultiplierMap.set(BoardCell.TripleLetter, 3);
letterMultiplierMap.set(BoardCell.DoubleWord, 1);
letterMultiplierMap.set(BoardCell.TripleWord, 1);

const wordMultiplierMap: Map<BoardCell, number> = new Map();
wordMultiplierMap.set(BoardCell.Empty, 1);
wordMultiplierMap.set(BoardCell.DoubleLetter, 1);
wordMultiplierMap.set(BoardCell.TripleLetter, 1);
wordMultiplierMap.set(BoardCell.DoubleWord, 2);
wordMultiplierMap.set(BoardCell.TripleWord, 3);

export class GridConfigService {
  tileMap: Record<string, import("../types/tile").BoardCell>;
  constructor() {
    this.tileMap = makeTileMap();
    console.log("[core service] GridConfigService initialized with tile map.");
  }

  getTileMap() {
    return this.tileMap;
  }

  getTileTypeAt(x: number, y: number) {
    const key = `${x},${y}`;
    return this.tileMap[key] ?? 0; // Default to BoardCell.Empty
  }

  getLetterMultiplierAt(x: number, y: number): number {
    const tile = this.getTileTypeAt(x, y);
    if (!tile) return 1;
    return letterMultiplierMap.get(tile) || 1;
  }

  getWordMultiplierAt(x: number, y: number): number {
    const tile = this.getTileTypeAt(x, y);
    if (!tile) return 1;
    return wordMultiplierMap.get(tile) || 1;
  }
}

// Singleton instance - created once on app load
export const gridConfigService = new GridConfigService();
