import { renderUtils } from "./renderUtils.js";
export class Grid {
  constructor(rows, cols, cellSize) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.liveLetters = [];
  }

  // Helper function to normalize letter data and prevent nesting
  _normalizeLetter(letterObj, row, col, isLive = true) {
    return {
      letter: letterObj.letter,
      value: letterObj.value || 0,
      id: letterObj.id,
      row: row,
      col: col,
      isLive: isLive,
      wildCard: letterObj.wildCard || false,
    };
  }

  _cellIsOccupied(row, col) {
    if (window.boardService) {
      return window.boardService.cellIsOccupied(row, col);
    }
    return false;
  }

  _getCol(mX) {
    return Math.floor(mX / this.cellSize);
  }

  _getRow(mY) {
    return Math.floor(mY / this.cellSize);
  }

  render() {
    // Render special tiles from tileConfigService
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tileType = window.tileConfigService.getTileTypeAt(col, row);

        renderUtils.renderBoardTileAtPosition(
          col * this.cellSize + this.cellSize / 2,
          row * this.cellSize + this.cellSize / 2,
          tileType,
          this.cellSize
        );

        if (col == 7 && row == 7) {
          renderUtils.renderCenterStar(
            col * this.cellSize + this.cellSize / 2,
            row * this.cellSize + this.cellSize / 2,
            this.cellSize
          );
        }
      }
    }

    // Highlight cell under mouse if a letter is being dragged
    renderUtils.renderShadedCellIfTileIsDragged(
      this.rows,
      this.cols,
      this.cellSize,
      this._cellIsOccupied.bind(this)
    );

    for (const letter of window.boardService.getPlacedLetters()) {
      if (
        window.gameContext.draggedLetter &&
        window.gameContext.dragSource === "grid" &&
        window.gameContext.draggedLetter.id === letter.id
      ) {
        continue;
      }

      renderUtils.renderTileWithLetter(letter, this.cellSize);
    }
  }

  renderOverlay() {
    renderUtils.renderGridOverlay(this.rows, this.cols, this.cellSize);
  }

  getWidth() {
    return this.cols * this.cellSize;
  }

  getHeight() {
    return this.rows * this.cellSize;
  }

  mouseIsOver() {
    return (
      mouseX >= 0 &&
      mouseX < this.getWidth() &&
      mouseY >= 0 &&
      mouseY < this.getHeight()
    );
  }

  canDropLetter() {
    const col = this._getCol(mouseX);
    const row = this._getRow(mouseY);
    return (
      col >= 0 &&
      col < this.cols &&
      row >= 0 &&
      row < this.rows &&
      !this._cellIsOccupied(row, col)
    );
  }

  showWildcardSelector(placedLetter) {
    window.gameContext.wildcard = {
      letter: placedLetter,
      selecting: true,
    };
  }

  dropLetter(letter) {
    const col = this._getCol(mouseX);
    const row = this._getRow(mouseY);
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      if (window.boardService) {
        const normalizedLetter = this._normalizeLetter(letter, row, col);
        const success = window.boardService.placeLetter(normalizedLetter);
        if (success) {
          this.liveLetters.push(normalizedLetter);
        }
        if (letter.wildCard) {
          this.showWildcardSelector(normalizedLetter);
        }
        return success;
      }
    }
    return false;
  }

  getMouseOverLetter() {
    const col = this._getCol(mouseX);
    const row = this._getRow(mouseY);
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
    this.liveLetters = this.liveLetters.filter((l) => l !== placedLetter);

    if (window.boardService && placedLetter) {
      window.boardService.removeLetter(placedLetter.row, placedLetter.col);
    }
  }

  finalizeMove() {
    let score = 0;
    let word = "";
    if (window.boardService && window.gameService) {
      word = this.getPlacedWord();
      // Scoring
      score = Array.from(window.boardService.getAllWords())
        .filter((word) => word.includeInScoring())
        .map((word) => word.getScore())
        .reduce((a, b) => a + b, 0);
      window.gameService.updateScore(score);
      window.boardService.finalizeMove();
      window.gameService.setLastWord(word);
      window.gameService.save();
    }
    this.lockLetters();
    return { score, word };
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

  isValidPlacement() {
    if (window.boardService) {
      return window.boardService.isValidPlacement();
    }
    return false;
  }

  hasPlacedAnyLetters() {
    return this.liveLetters.length > 0;
  }

  getPlacedWord() {
    if (window.boardService) {
      return window.boardService.getPlacedWord();
    }
  }

  isValidWord() {
    if (window.boardService) {
      const word = this.getPlacedWord();
      return window.dictionaryService.hasWord(word);
    }
    return false;
  }

  validateAllWords() {
    if (window.boardService) {
      const allWords = window.boardService.getAllWords();
      const words = Array.from(allWords).map((w) => w.getWord());
      if (window.dictionaryService) {
        const validationResult = window.dictionaryService.validateWords(words);
        return validationResult.allValid;
      }
    }
    return false;
  }

  isCenterCellOccupied() {
    if (window.boardService) {
      return window.boardService.cellIsOccupied(7, 7);
    }
    return false;
  }

  isFirstMove() {
    if (window.boardService) {
      return window.boardService.isFirstMove();
    }
    return false;
  }

  load() {
    if (window.boardService) {
      window.boardService.load();
    }
  }
}
