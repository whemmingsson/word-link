export class Grid {
  constructor(rows, cols, cellSize) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.letters = [];
    this.liveLetters = [];
  }

  _cellIsOccupied(row, col) {
    if (window.boardService) {
      const boardState = window.boardService.getBoardState();
      return boardState[row][col].letter !== "";
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

    // Draw live letters (being placed this turn)
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    for (let i = 0; i < this.liveLetters.length; i++) {
      const placedLetter = this.liveLetters[i];

      // Skip rendering if this letter is being dragged from the grid
      if (
        window.gameContext.letterBeeingDragged &&
        window.gameContext.dragSource === "grid" &&
        window.gameContext.draggedGridLetter === placedLetter
      ) {
        continue;
      }

      const x = placedLetter.col * this.cellSize + this.cellSize / 2;
      const y = placedLetter.row * this.cellSize + this.cellSize / 2;
      fill("#ffe881ff");
      rect(
        x - this.cellSize / 2,
        y - this.cellSize / 2,
        this.cellSize,
        this.cellSize
      );
      fill(0);
      text(placedLetter.letter, x, y);
    }

    // Draw placed letters from BoardService
    if (window.boardService) {
      fill(0);
      textSize(24);
      textAlign(CENTER, CENTER);

      const letterTile = window.boardService.getPlacedLetters();

      if (letterTile.letter !== "") {
        // Skip rendering if this letter is being dragged from the grid
        const isBeingDragged =
          window.gameContext.letterBeeingDragged &&
          window.gameContext.dragSource === "grid" &&
          window.gameContext.draggedGridLetter &&
          window.gameContext.draggedGridLetter.row === row &&
          window.gameContext.draggedGridLetter.col === col;

        if (isBeingDragged) {
          return;
        }

        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        fill(0);
        text(letterTile.letter, x, y);
      }
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
    console.log("Dropping letter:", letter);
    const mX = mouseX;
    const mY = mouseY;
    const col = this._getCol(mX);
    const row = this._getRow(mY);
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      if (window.boardService) {
        const success = window.boardService.placeLetter(row, col, letter);
        if (success) {
          const placedLetter = {
            letter: letter.letter,
            value: letter.value,
            row: row,
            col: col,
          };
          this.letters.push(placedLetter);
          this.liveLetters.push(placedLetter);
        }
        return success;
      }
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

    // Also remove from BoardService
    /*if (window.boardService && placedLetter) {
      const boardState = window.boardService.getBoardState();
      if (
        boardState[placedLetter.row] &&
        boardState[placedLetter.row][placedLetter.col]
      ) {
        boardState[placedLetter.row][placedLetter.col] = {
          letter: "",
          value: 0,
        };
      }
    } */
  }

  finishMove() {
    console.log(this.liveLetters);
    // Move the live letters to permanent state in BoardService
    if (window.boardService) {
      for (let i = 0; i < this.liveLetters.length; i++) {
        const placedLetter = this.liveLetters[i];
        window.boardService.finalizeLetterPlacement(
          placedLetter.row,
          placedLetter.col
        );
      }
    }
    this.lockLetters();
  }

  resetMove() {
    // Remove live letters from BoardService
    if (window.boardService) {
      for (let i = 0; i < this.liveLetters.length; i++) {
        const placedLetter = this.liveLetters[i];
        window.boardService.removeLetter(placedLetter.row, placedLetter.col);
      }
    }
    this.liveLetters = [];
  }
}
