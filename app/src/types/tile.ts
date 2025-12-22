export const Tile = {
  Empty: 0,
  DoubleLetter: 1,
  TripleLetter: 2,
  DoubleWord: 3,
  TripleWord: 4,
} as const;

export type Tile = (typeof Tile)[keyof typeof Tile];

export interface GridTile {
  tileType: Tile;
  x: number;
  y: number;
}

export interface TileConfigType {
  tiles: GridTile[];
}
