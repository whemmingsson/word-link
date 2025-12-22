import { Tile, type TileConfigType } from "../types/tile";

export const TileConfig: TileConfigType = {
  tiles: [
    // Row 1
    { tileType: Tile.TripleWord, x: 0, y: 0 },
    { tileType: Tile.DoubleLetter, x: 3, y: 0 },
    { tileType: Tile.TripleWord, x: 7, y: 0 },
    { tileType: Tile.DoubleLetter, x: 11, y: 0 },
    { tileType: Tile.TripleWord, x: 14, y: 0 },

    // Row 2
    { tileType: Tile.DoubleWord, x: 1, y: 1 },
    { tileType: Tile.TripleLetter, x: 5, y: 1 },
    { tileType: Tile.TripleLetter, x: 9, y: 1 },
    { tileType: Tile.DoubleWord, x: 13, y: 1 },

    // Row 3
    { tileType: Tile.DoubleWord, x: 2, y: 2 },
    { tileType: Tile.DoubleLetter, x: 6, y: 2 },
    { tileType: Tile.DoubleLetter, x: 8, y: 2 },
    { tileType: Tile.DoubleWord, x: 12, y: 2 },

    // Row 4
    { tileType: Tile.DoubleLetter, x: 0, y: 3 },
    { tileType: Tile.DoubleWord, x: 3, y: 3 },
    { tileType: Tile.DoubleLetter, x: 7, y: 3 },
    { tileType: Tile.DoubleWord, x: 11, y: 3 },
    { tileType: Tile.DoubleLetter, x: 14, y: 3 },

    // Row 5
    { tileType: Tile.DoubleWord, x: 4, y: 4 },
    { tileType: Tile.DoubleWord, x: 10, y: 4 },

    // Row 6
    { tileType: Tile.TripleLetter, x: 1, y: 5 },
    { tileType: Tile.TripleLetter, x: 5, y: 5 },
    { tileType: Tile.TripleLetter, x: 9, y: 5 },
    { tileType: Tile.TripleLetter, x: 13, y: 5 },

    // Row 7
    { tileType: Tile.DoubleLetter, x: 2, y: 6 },
    { tileType: Tile.DoubleLetter, x: 6, y: 6 },
    { tileType: Tile.DoubleLetter, x: 8, y: 6 },
    { tileType: Tile.DoubleLetter, x: 12, y: 6 },

    // Row 8
    { tileType: Tile.TripleWord, x: 0, y: 7 },
    { tileType: Tile.DoubleLetter, x: 3, y: 7 },
    { tileType: Tile.DoubleLetter, x: 11, y: 7 },
    { tileType: Tile.TripleWord, x: 14, y: 7 },

    // Row 9
    { tileType: Tile.DoubleLetter, x: 2, y: 8 },
    { tileType: Tile.DoubleLetter, x: 6, y: 8 },
    { tileType: Tile.DoubleLetter, x: 8, y: 8 },
    { tileType: Tile.DoubleLetter, x: 12, y: 8 },

    // Row 10
    { tileType: Tile.TripleLetter, x: 1, y: 9 },
    { tileType: Tile.TripleLetter, x: 5, y: 9 },
    { tileType: Tile.TripleLetter, x: 9, y: 9 },
    { tileType: Tile.TripleLetter, x: 13, y: 9 },

    // Row 11
    { tileType: Tile.DoubleWord, x: 4, y: 10 },
    { tileType: Tile.DoubleWord, x: 10, y: 10 },

    // Row 12
    { tileType: Tile.DoubleLetter, x: 0, y: 11 },
    { tileType: Tile.DoubleWord, x: 3, y: 11 },
    { tileType: Tile.DoubleLetter, x: 7, y: 11 },
    { tileType: Tile.DoubleWord, x: 11, y: 11 },
    { tileType: Tile.DoubleLetter, x: 14, y: 11 },

    // Row 13
    { tileType: Tile.DoubleWord, x: 2, y: 12 },
    { tileType: Tile.DoubleLetter, x: 6, y: 12 },
    { tileType: Tile.DoubleLetter, x: 8, y: 12 },
    { tileType: Tile.DoubleWord, x: 12, y: 12 },

    // Row 14
    { tileType: Tile.DoubleWord, x: 1, y: 13 },
    { tileType: Tile.TripleLetter, x: 5, y: 13 },
    { tileType: Tile.TripleLetter, x: 9, y: 13 },
    { tileType: Tile.DoubleWord, x: 13, y: 13 },

    // Row 15
    { tileType: Tile.TripleWord, x: 0, y: 14 },
    { tileType: Tile.DoubleLetter, x: 3, y: 14 },
    { tileType: Tile.TripleWord, x: 7, y: 14 },
    { tileType: Tile.DoubleLetter, x: 11, y: 14 },
    { tileType: Tile.TripleWord, x: 14, y: 14 },
  ],
};

export const makeTileMap = () => {
  const tileMap: Record<string, Tile> = {};
  for (const gridTile of TileConfig.tiles) {
    const key = `${gridTile.x},${gridTile.y}`;
    tileMap[key] = gridTile.tileType;
  }
  return tileMap;
};
