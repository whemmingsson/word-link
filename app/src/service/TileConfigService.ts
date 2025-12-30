import { makeTileMap } from "../config/tileConfig";
import { Tile } from "../types/tile";

const letterMultiplierMap: Map<Tile, number> = new Map();
letterMultiplierMap.set(Tile.Empty, 1);
letterMultiplierMap.set(Tile.DoubleLetter, 2);
letterMultiplierMap.set(Tile.TripleLetter, 3);
letterMultiplierMap.set(Tile.DoubleWord, 1);
letterMultiplierMap.set(Tile.TripleWord, 1);

const wordMultiplierMap: Map<Tile, number> = new Map();
wordMultiplierMap.set(Tile.Empty, 1);
wordMultiplierMap.set(Tile.DoubleLetter, 1);
wordMultiplierMap.set(Tile.TripleLetter, 1);
wordMultiplierMap.set(Tile.DoubleWord, 2);
wordMultiplierMap.set(Tile.TripleWord, 3);

export class TileConfigService {
  tileMap: Record<string, import("../types/tile").Tile>;
  constructor() {
    this.tileMap = makeTileMap();
    console.log("[core service] TileConfigService initialized with tile map.");
  }

  getTileMap() {
    return this.tileMap;
  }

  getTileTypeAt(x: number, y: number) {
    const key = `${x},${y}`;
    return this.tileMap[key] ?? 0; // Default to Tile.Empty
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
export const tileConfigService = new TileConfigService();
