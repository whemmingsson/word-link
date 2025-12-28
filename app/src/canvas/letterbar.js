import { renderUtils } from "./renderUtils";
import { styleUtils } from "./styleUtils";

export class Letterbar {
  constructor(x, y, width, cellSize) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.letters = [];
    this.lettersOnGrid = [];
    this.padding = 20;
    this.height = cellSize + this.padding * 2;
  }

  _getLetterX(index) {
    return (
      this.x +
      this.padding +
      index * window.gameContext.cellSize * 1.5 +
      window.gameContext.cellSize / 2
    );
  }

  _getLetterY() {
    return this.y + this.height / 2;
  }

  drawLetterbar() {
    fill(styleUtils.letterBar.backgroundColor);
    stroke(styleUtils.letterBar.borderColor);
    strokeWeight(1);
    rect(this.x, this.y, this.width, this.height);
    this.renderLetters();
  }

  renderLetters() {
    let mouseOverAnyLetter = false;
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

      if (
        mouseX > x - window.gameContext.cellSize / 2 &&
        mouseX < x + window.gameContext.cellSize / 2 &&
        mouseY > y - window.gameContext.cellSize / 2 &&
        mouseY < y + window.gameContext.cellSize / 2
      ) {
        mouseOverAnyLetter = true;
      }

      renderUtils.renderLetterTileAtPosition(
        this.letters[i],
        x,
        y,
        window.gameContext.cellSize
      );
    }
  }

  mouseIsOver() {
    const mX = mouseX;
    const mY = mouseY;
    return (
      mX >= this.x &&
      mX < this.x + this.width &&
      mY >= this.y &&
      mY < this.y + this.height
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
      this.letters = window.letterPoolService.drawLetters(7);
      console.log("Letterbar initialized with letters:", this.letters);
    }
  }

  getLetterAtPosition(x, y) {
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

  removeLetter(letterObj) {
    this.letters = this.letters.filter((l) => l !== letterObj);
    this.lettersOnGrid.push(letterObj.letter);
  }

  addLetter(letter) {
    if (letter.wildCard) {
      letter.letter = "*";
    }
    this.letters.push(letter);
    this.lettersOnGrid = this.lettersOnGrid.filter((l) => l !== letter);
  }
}
