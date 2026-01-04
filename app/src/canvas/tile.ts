import type { Letter } from "../types/Letter";
import { renderUtils } from "../utils/renderUtils";

export class Tile {
  x: number;
  y: number;
  letter: Letter | null;
  tileCellSize: number;
  constructor(x: number, y: number, letter: Letter | null = null) {
    this.x = x;
    this.y = y;
    this.letter = letter;
    this.tileCellSize = 64;
  }

  getLetter() {
    return this.letter;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setX(x: number) {
    this.x = x;
  }

  setY(y: number) {
    this.y = y;
  }

  setSize(size: number) {
    this.tileCellSize = size;
  }

  setLetter(letter: Letter) {
    this.letter = letter;
  }

  render() {
    renderUtils.renderLetterTileAtPosition(
      this.letter!,
      this.x,
      this.y,
      this.tileCellSize,
      window.gameContext.barLetterTextSize
    );
  }
}
