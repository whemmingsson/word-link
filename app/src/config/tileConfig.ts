import { BoardCell, type BoardConfigType } from "../types/tile";

export const TileConfig: BoardConfigType = {
  cells: [
    // Row 1
    { tileType: BoardCell.TripleWord, x: 0, y: 0 },
    { tileType: BoardCell.DoubleLetter, x: 3, y: 0 },
    { tileType: BoardCell.TripleWord, x: 7, y: 0 },
    { tileType: BoardCell.DoubleLetter, x: 11, y: 0 },
    { tileType: BoardCell.TripleWord, x: 14, y: 0 },
    // Row 2
    { tileType: BoardCell.DoubleWord, x: 1, y: 1 },
    { tileType: BoardCell.TripleLetter, x: 5, y: 1 },
    { tileType: BoardCell.TripleLetter, x: 9, y: 1 },
    { tileType: BoardCell.DoubleWord, x: 13, y: 1 },

    // Row 3
    { tileType: BoardCell.DoubleWord, x: 2, y: 2 },
    { tileType: BoardCell.DoubleLetter, x: 6, y: 2 },
    { tileType: BoardCell.DoubleLetter, x: 8, y: 2 },
    { tileType: BoardCell.DoubleWord, x: 12, y: 2 },

    // Row 4
    { tileType: BoardCell.DoubleLetter, x: 0, y: 3 },
    { tileType: BoardCell.DoubleWord, x: 3, y: 3 },
    { tileType: BoardCell.DoubleLetter, x: 7, y: 3 },
    { tileType: BoardCell.DoubleWord, x: 11, y: 3 },
    { tileType: BoardCell.DoubleLetter, x: 14, y: 3 },

    // Row 5
    { tileType: BoardCell.DoubleWord, x: 4, y: 4 },
    { tileType: BoardCell.DoubleWord, x: 10, y: 4 },
    // Row 6
    { tileType: BoardCell.TripleLetter, x: 1, y: 5 },
    { tileType: BoardCell.TripleLetter, x: 5, y: 5 },
    { tileType: BoardCell.TripleLetter, x: 9, y: 5 },
    { tileType: BoardCell.TripleLetter, x: 13, y: 5 },

    // Row 7
    { tileType: BoardCell.DoubleLetter, x: 2, y: 6 },
    { tileType: BoardCell.DoubleLetter, x: 6, y: 6 },
    { tileType: BoardCell.DoubleLetter, x: 8, y: 6 },
    { tileType: BoardCell.DoubleLetter, x: 12, y: 6 },

    // Row 8
    { tileType: BoardCell.TripleWord, x: 0, y: 7 },
    { tileType: BoardCell.DoubleLetter, x: 3, y: 7 },
    { tileType: BoardCell.DoubleLetter, x: 11, y: 7 },
    { tileType: BoardCell.TripleWord, x: 14, y: 7 },

    // Row 9
    { tileType: BoardCell.DoubleLetter, x: 2, y: 8 },
    { tileType: BoardCell.DoubleLetter, x: 6, y: 8 },
    { tileType: BoardCell.DoubleLetter, x: 8, y: 8 },
    { tileType: BoardCell.DoubleLetter, x: 12, y: 8 },

    // Row 10
    { tileType: BoardCell.TripleLetter, x: 1, y: 9 },
    { tileType: BoardCell.TripleLetter, x: 5, y: 9 },
    { tileType: BoardCell.TripleLetter, x: 9, y: 9 },
    { tileType: BoardCell.TripleLetter, x: 13, y: 9 },

    // Row 11
    { tileType: BoardCell.DoubleWord, x: 4, y: 10 },
    { tileType: BoardCell.DoubleWord, x: 10, y: 10 },
    // Row 12
    { tileType: BoardCell.DoubleLetter, x: 0, y: 11 },
    { tileType: BoardCell.DoubleWord, x: 3, y: 11 },
    { tileType: BoardCell.DoubleLetter, x: 7, y: 11 },
    { tileType: BoardCell.DoubleWord, x: 11, y: 11 },
    { tileType: BoardCell.DoubleLetter, x: 14, y: 11 },
    // Row 13
    { tileType: BoardCell.DoubleWord, x: 2, y: 12 },
    { tileType: BoardCell.DoubleLetter, x: 6, y: 12 },
    { tileType: BoardCell.DoubleLetter, x: 8, y: 12 },
    { tileType: BoardCell.DoubleWord, x: 12, y: 12 },

    // Row 14
    { tileType: BoardCell.DoubleWord, x: 1, y: 13 },
    { tileType: BoardCell.TripleLetter, x: 5, y: 13 },
    { tileType: BoardCell.TripleLetter, x: 9, y: 13 },
    { tileType: BoardCell.DoubleWord, x: 13, y: 13 },

    // Row 15
    { tileType: BoardCell.TripleWord, x: 0, y: 14 },
    { tileType: BoardCell.DoubleLetter, x: 3, y: 14 },
    { tileType: BoardCell.TripleWord, x: 7, y: 14 },
    { tileType: BoardCell.DoubleLetter, x: 11, y: 14 },
    { tileType: BoardCell.TripleWord, x: 14, y: 14 },
  ],
};

export const makeTileMap = () => {
  const tileMap: Record<string, BoardCell> = {};
  for (const gridTile of TileConfig.cells) {
    const key = `${gridTile.x},${gridTile.y}`;
    tileMap[key] = gridTile.tileType;
  }
  return tileMap;
};
