import type { Letter } from "../types/Letter";
import { renderUtils } from "../utils/renderUtils";
import { styleUtils } from "../utils/styleUtils";
import type P5 from "p5";
import { Tile } from "./tile";

const toTile = (letter: Letter, x: number, y: number): Tile => {
  const tile = new Tile(x, y, letter);
  return tile;
};

export class Letterbar {
  p5: P5;
  x: number;
  y: number;
  width: number;
  padding: number;
  height: number;
  markedLettersIndices: number[];
  tileCellSize: number;
  spacingMultiplier: number;
  tiles: Tile[]; // New way to manage letter tiles
  constructor(p5: P5, x: number, y: number, width: number) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.width = width;
    this.padding = 5;
    this.height = 70;
    this.markedLettersIndices = [];
    this.tileCellSize = 64;
    this.spacingMultiplier = 1.1;
    this.tiles = [];
    this.updateTileCellSize();
  }

  _getLetterX(index: number) {
    return (
      this.x +
      this.padding * this.spacingMultiplier +
      index * this.tileCellSize * this.spacingMultiplier +
      this.tileCellSize / 2
    );
  }

  _getLetterY() {
    return this.y + this.height / 2;
  }

  render() {
    this.p5.fill(styleUtils.letterBar.backgroundColor);
    this.p5.stroke(styleUtils.letterBar.borderColor);
    this.p5.strokeWeight(1);
    this.p5.rect(this.x, this.y, this.width, this.height);
    this.renderLetters();
  }

  renderLetters() {
    for (let i = 0; i < this.tiles.length; i++) {
      // Skip rendering if this letter is being dragged from the bar
      if (
        window.gameContext.draggedLetter &&
        window.gameContext.dragSource === "bar" &&
        this.tiles[i].getLetter() === window.gameContext.draggedLetter
      ) {
        continue;
      }

      this.tiles[i].render();

      if (this.markedLettersIndices.includes(i)) {
        renderUtils.renderLetterHighlightAtPosition(
          this.tiles[i].getX(),
          this.tiles[i].getY(),
          this.tileCellSize
        );
      }
    }
  }

  mouseIsOver() {
    return (
      this.p5.mouseX >= this.x &&
      this.p5.mouseX < this.x + this.width &&
      this.p5.mouseY >= this.y &&
      this.p5.mouseY < this.y + this.height
    );
  }

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.width;
  }

  setY(y: number) {
    this.y = y;
    for (const t of this.tiles) {
      t.setY(y + this.height / 2);
    }
  }

  setX(x: number) {
    this.x = x;
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].setX(this._getLetterX(i));
    }
  }

  setWidth(width: number) {
    this.width = width;
    this.updateTileCellSize();

    this.tiles.forEach((t, index) => {
      t.setX(this._getLetterX(index));
    });
  }

  init() {
    if (window.letterPoolService) {
      window.letterPoolService.init();
      this.tiles = window.letterPoolService
        .drawLetters(7)
        .map((letter, index) =>
          toTile(letter, this._getLetterX(index), this.y + this.height / 2)
        );
    }
  }

  getLetterAtMousePosition() {
    const x = this.p5.mouseX;
    const y = this.p5.mouseY;
    // Larger hit area for better touch support (1.2x the cell size)
    const hitAreaMultiplier = 1.2;
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      const letter = tile.getLetter();
      const letterX = tile.getX();
      const letterY = tile.getY();

      const hitSize = (this.tileCellSize * hitAreaMultiplier) / 2;

      if (
        x > letterX - hitSize &&
        x < letterX + hitSize &&
        y > letterY - hitSize &&
        y < letterY + hitSize
      ) {
        return letter;
      }
    }
    return null;
  }

  redrawLettersFromPool() {
    const lettersNeeded = 7 - this.tiles.length;
    if (lettersNeeded > 0) {
      const newLetters = window.letterPoolService.drawLetters(lettersNeeded);
      for (const letter of newLetters) {
        this.tiles.push(
          toTile(
            letter,
            this._getLetterX(this.tiles.length),
            this.y + this.height / 2
          )
        );
      }
    }
    this.updateTilePositions();
  }

  removeLetter(letterObj: Letter) {
    this.tiles = this.tiles.filter((tile) => tile.getLetter() !== letterObj);
    this.updateTilePositions();
  }

  addLetter(letter: Letter) {
    if (letter.wildCard) {
      letter.letter = "*";
    }
    this.tiles.push(
      toTile(
        letter,
        this._getLetterX(this.tiles.length - 1),
        this.y + this.height / 2
      )
    );
    this.updateTilePositions();
  }

  shuffleLetters() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  toggleMarkLetterAtIndex(index: number) {
    const markIndex = this.markedLettersIndices.indexOf(index);
    if (markIndex === -1) {
      this.markedLettersIndices.push(index);
    } else {
      this.markedLettersIndices.splice(markIndex, 1);
    }
  }

  switchMarkedLetters() {
    if (this.markedLettersIndices.length < 1) {
      return;
    }
    const lettersToSwitch = this.markedLettersIndices.map(
      (i) => this.tiles[i].getLetter()!
    );
    const newLetters = window.letterPoolService.switchLetters(lettersToSwitch);
    this.tiles = this.tiles.filter(
      (tile) => !lettersToSwitch.includes(tile.getLetter()!)
    );
    for (const letter of newLetters) {
      this.tiles.push(
        toTile(
          letter,
          this._getLetterX(this.tiles.length),
          this.y + this.height / 2
        )
      );
    }
    this.markedLettersIndices = [];

    this.updateTilePositions();
  }

  hasMarkedLetters() {
    return this.markedLettersIndices.length > 0;
  }

  save() {
    if (window.persistanceService) {
      window.persistanceService.save(
        "letterbarState",
        this.tiles.map((tile) => tile.getLetter())
      );
    }
    if (window.letterPoolService) {
      window.letterPoolService.save();
    }
  }

  load() {
    if (window.persistanceService) {
      const savedLetters =
        window.persistanceService.load<Letter[]>("letterbarState");
      if (savedLetters) {
        this.tiles = savedLetters.map((letter, index) =>
          toTile(letter, this._getLetterX(index), this.y + this.height / 2)
        );
      }
    }
    if (window.letterPoolService) {
      window.letterPoolService.load();
    }
  }

  updateTileCellSize() {
    // Calculate optimal cell size based on horizontal spacing constraints
    // With 7 letters, we need: left_padding + cellSize/2 + 6*cellSize*spacing + cellSize/2 + right_padding
    // Which simplifies to: 2*padding*spacing + cellSize*(1 + 6*spacing)
    // Solving for cellSize: (width - 2*padding*spacing) / (1 + 6*spacing)
    const horizontalConstraint =
      (this.width - 2 * this.padding * this.spacingMultiplier) /
      (1 + 6 * this.spacingMultiplier);

    // Calculate maximum cell size based on vertical constraints
    // We need spacing top and bottom: 2*padding*spacing + cellSize <= height
    const verticalConstraint =
      this.height - 2 * this.padding * this.spacingMultiplier;

    // Use the smaller of the two constraints to ensure letters fit in both dimensions
    this.tileCellSize = Math.max(
      10,
      Math.min(horizontalConstraint, verticalConstraint)
    );

    console.log(`Letterbar tile cell size updated to ${this.tileCellSize}`);

    for (const t of this.tiles) {
      t.setSize(this.tileCellSize);
    }
  }

  updateTilePositions() {
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].setX(this._getLetterX(i));
      this.tiles[i].setY(this.y + this.height / 2);
    }
  }
}
