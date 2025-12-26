export class Grid {
  constructor(rows, cols, cellSize) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.letters = [];
    this.liveLetters = [];
  }

  _cellIsOccupied(row, col) {
    for (let i = 0; i < this.letters.length; i++) {
      if (this.letters[i].row === row && this.letters[i].col === col) {
        return true;
      }
    }
    return false;
  }

  _getCol(mX) {
    return Math.floor(mX / this.cellSize);
  }

  _getRow(mY) {
    return Math.floor(mY / this.cellSize);
  }

  drawGrid() {
    stroke("#ccc");
    strokeWeight(1);

    // Draw horizontal lines
    for (let row = 0; row <= this.rows; row++) {
      line(
        0,
        row * this.cellSize,
        this.cols * this.cellSize,
        row * this.cellSize
      );
    }

    // Draw vertical lines
    for (let col = 0; col <= this.cols; col++) {
      line(
        col * this.cellSize,
        0,
        col * this.cellSize,
        this.rows * this.cellSize
      );
    }

    const mX = mouseX;
    const mY = mouseY;
    const col = Math.floor(mX / this.cellSize);
    const row = Math.floor(mY / this.cellSize);
    if (
      col >= 0 &&
      col < this.cols &&
      row >= 0 &&
      row < this.rows &&
      window.gameContext.letterBeeingDragged &&
      !this._cellIsOccupied(row, col)
    ) {
      fill("#eee");
      rect(
        col * this.cellSize,
        row * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    } else {
      cursor(ARROW);
    }

    // Draw placed letters
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    for (let i = 0; i < this.letters.length; i++) {
      // Skip rendering if this letter is being dragged from the grid
      if (
        window.gameContext.letterBeeingDragged &&
        window.gameContext.dragSource === "grid" &&
        this.letters[i] === window.gameContext.draggedGridLetter
      ) {
        continue;
      }

      const letter = this.letters[i].letter;
      const x = this.letters[i].col * this.cellSize + this.cellSize / 2;
      const y = this.letters[i].row * this.cellSize + this.cellSize / 2;
      fill("#ffe881ff");
      rect(
        x - window.gameContext.cellSize / 2,
        y - window.gameContext.cellSize / 2,
        window.gameContext.cellSize,
        window.gameContext.cellSize
      );
      fill(0);
      text(letter, x, y);
    }
  }

  getWidth() {
    return this.cols * this.cellSize;
  }

  getHeight() {
    return this.rows * this.cellSize;
  }

  mouseIsOver() {
    const mX = mouseX;
    const mY = mouseY;
    return mX >= 0 && mX < this.getWidth() && mY >= 0 && mY < this.getHeight();
  }

  canDropLetter() {
    const mX = mouseX;
    const mY = mouseY;
    const col = this._getCol(mX);
    const row = this._getRow(mY);
    return (
      col >= 0 &&
      col < this.cols &&
      row >= 0 &&
      row < this.rows &&
      !this._cellIsOccupied(row, col)
    );
  }

  dropLetter(letter) {
    const mX = mouseX;
    const mY = mouseY;
    const col = this._getCol(mX);
    const row = this._getRow(mY);
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      const placedLetter = { letter: letter, row: row, col: col };
      this.letters.push(placedLetter);
      this.liveLetters.push(placedLetter);
      return true;
    }
    return false;
  }

  getMouseOverLetter() {
    const mX = mouseX;
    const mY = mouseY;
    const col = this._getCol(mX);
    const row = this._getRow(mY);
    for (let i = 0; i < this.liveLetters.length; i++) {
      if (this.liveLetters[i].col === col && this.liveLetters[i].row === row) {
        return this.liveLetters[i];
      }
    }
    return null;
  }

  lockLetters() {
    this.liveLetters = [];
  }

  removeLetter(placedLetter) {
    this.letters = this.letters.filter((l) => l !== placedLetter);
    this.liveLetters = this.liveLetters.filter((l) => l !== placedLetter);
  }
}
