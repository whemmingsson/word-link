import type { Letter } from "../types/Letter";
import { renderUtils } from "./renderUtils";

//@ts-ignore
import { styleUtils } from "./styleUtils";
import type P5 from "p5";

export class Letterbar {
  p5: P5;
  x: number;
  y: number;
  width: number;
  letters: Letter[];
  lettersOnGrid: Letter[];
  padding: number;
  height: number;
  markedLettersIndices: number[];
  tileCellSize: number;
  spacingMultiplier: number;
  constructor(p5: P5, x: number, y: number, width: number) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.width = width;
    this.letters = [];
    this.lettersOnGrid = [];
    this.padding = 5;
    this.height = 70;
    this.markedLettersIndices = [];
    this.tileCellSize = 64;
    this.spacingMultiplier = 1.1;
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
    // Center letters vertically in the bar
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
    for (let i = 0; i < this.letters.length; i++) {
      // Skip rendering if this letter is being dragged from the bar
      if (
        window.gameContext.draggedLetter &&
        window.gameContext.dragSource === "bar" &&
        this.letters[i] === window.gameContext.draggedLetter
      ) {
        continue;
      }

      const x = this._getLetterX(i);
      const y = this._getLetterY();

      renderUtils.renderLetterTileAtPosition(
        this.letters[i],
        x,
        y,
        this.tileCellSize
      );

      // Highlight if marked
      if (
        window.gameContext.switchLetters &&
        this.markedLettersIndices.includes(i)
      ) {
        renderUtils.renderLetterHighlightAtPosition(
          x,
          y,
          window.gameContext.cellSize
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

  init() {
    if (window.letterPoolService) {
      window.letterPoolService.init();
      this.letters = window.letterPoolService.drawLetters(7);
    }
  }

  getLetterAtMousePosition() {
    const x = this.p5.mouseX;
    const y = this.p5.mouseY;
    // Larger hit area for better touch support (1.2x the cell size)
    const hitAreaMultiplier = 1.2;
    for (let i = 0; i < this.letters.length; i++) {
      const letterX = this._getLetterX(i);
      const letterY = this._getLetterY();

      const hitSize = (window.gameContext.cellSize * hitAreaMultiplier) / 2;

      if (
        x > letterX - hitSize &&
        x < letterX + hitSize &&
        y > letterY - hitSize &&
        y < letterY + hitSize
      ) {
        return this.letters[i];
      }
    }
    return null;
  }

  redrawLettersFromPool() {
    const lettersNeeded = 7 - this.letters.length;
    if (lettersNeeded > 0) {
      const newLetters = window.letterPoolService.drawLetters(lettersNeeded);
      this.letters.push(...newLetters);
    }
  }

  removeLetter(letterObj: Letter) {
    this.letters = this.letters.filter((l) => l !== letterObj);
    this.lettersOnGrid.push(letterObj);
  }

  addLetter(letter: Letter) {
    if (letter.wildCard) {
      letter.letter = "*";
    }
    this.letters.push(letter);
    this.lettersOnGrid = this.lettersOnGrid.filter((l) => l !== letter);
  }

  shuffleLetters() {
    for (let i = this.letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.letters[i], this.letters[j]] = [this.letters[j], this.letters[i]];
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
      (i) => this.letters[i]
    );
    const newLetters = window.letterPoolService.switchLetters(lettersToSwitch);
    this.letters = this.letters.filter((l) => !lettersToSwitch.includes(l));
    this.letters.push(...newLetters);
    this.markedLettersIndices = [];
  }

  hasMarkedLetters() {
    return this.markedLettersIndices.length > 0;
  }

  save() {
    if (window.persistanceService) {
      window.persistanceService.save("letterbarState", this.letters);
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
        this.letters = savedLetters;
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
  }
}
