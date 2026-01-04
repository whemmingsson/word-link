import type { LetterTile } from "../types/LetterTile";

export class Tile {
  x: number;
  y: number;
  letterTile: LetterTile | null;
  constructor() {
    this.x = 0;
    this.y = 0;
    this.letterTile = null; // LetterTile
  }

  getLetterTile() {
    return this.letterTile;
  }

  render() {}
}
