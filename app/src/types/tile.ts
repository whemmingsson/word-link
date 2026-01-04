export const BoardCell = {
  Empty: 0,
  DoubleLetter: 1,
  TripleLetter: 2,
  DoubleWord: 3,
  TripleWord: 4,
} as const;

export type BoardCell = (typeof BoardCell)[keyof typeof BoardCell];

export interface GameGridTile {
  tileType: BoardCell;
  x: number;
  y: number;
}

export interface BoardConfigType {
  cells: GameGridTile[];
}
