import { makeTileMap } from "../config/tileConfig";

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
}

// Singleton instance - created once on app load
export const tileConfigService = new TileConfigService();
