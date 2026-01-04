import type { Letter } from "../types/Letter.js";
// @ts-ignore: Ignore missing module error for renderUtils for now
import { renderUtils } from "../utils/renderUtils.js";
import type P5 from "p5";
export class Grid {
  p5: P5;
  rows: number;
  cols: number;
  cellSize: number;
  liveLetters: Letter[];
  constructor(p5: P5, rows: number, cols: number, cellSize: number) {
    this.p5 = p5;
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.liveLetters = [];
  }

  // Helper function to normalize letter data and prevent nesting
  _normalizeLetter(letterObj: any, row: number, col: number, isLive = true) {
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

  // Get mouse coordinates, applying zoom transformation if zoom is enabled
  // This ensures that when the grid is zoomed, we get the correct grid cell under the mouse cursor
  _getTransformedMouseCoords() {
    // Check if zoom is enabled and zoom controller is available
    if (
      window.gameContext?.EXPERIMENTAL?.zoomEnabled &&
      window.gameContext?.zoomController
    ) {
      // Transform screen coordinates to canvas coordinates
      return window.gameContext.zoomController.screenToCanvas(
        this.p5.mouseX,
        this.p5.mouseY
      );
    }
    // No zoom - use raw mouse coordinates
    return { x: this.p5.mouseX, y: this.p5.mouseY };
  }

  _cellIsOccupied(row: number, col: number) {
    if (window.boardService) {
      return window.boardService.cellIsOccupied(row, col);
    }
    return false;
  }

  // Convert x coordinate to grid column, using transformed mouse position when zoom is active
  _getCol(mX: number) {
    return Math.floor(mX / this.cellSize);
  }

  // Convert y coordinate to grid row, using transformed mouse position when zoom is active
  _getRow(mY: number) {
    return Math.floor(mY / this.cellSize);
  }

  render() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tileType = window.gridConfigService.getTileTypeAt(col, row);

        // This renders the board tile (including special tiles)
        renderUtils.renderBoardCellAtPosition(
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
    // Pass transformed coordinates so highlighting works correctly when zoomed
    const coords = this._getTransformedMouseCoords();
    renderUtils.renderShadedCellIfTileIsDragged(
      this.rows,
      this.cols,
      this.cellSize,
      this._cellIsOccupied.bind(this),
      coords.x,
      coords.y
    );

    // Render placed letters on the grid
    for (const letter of window.boardService.getPlacedLetters()) {
      if (
        window.gameContext.draggedLetter &&
        window.gameContext.dragSource === "grid" &&
        window.gameContext.draggedLetter.id === letter.id
      ) {
        continue;
      }

      renderUtils.renderTileWithLetter(
        letter,
        this.cellSize,
        window.gameContext.letterTileTextSize
      );
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
    // Use transformed coordinates to check if mouse is over grid (accounts for zoom/pan)
    const coords = this._getTransformedMouseCoords();
    return (
      coords.x >= 0 &&
      coords.x < this.getWidth() &&
      coords.y >= 0 &&
      coords.y < this.getHeight()
    );
  }

  canDropLetter() {
    // Use transformed coordinates to find the correct cell under cursor (accounts for zoom/pan)
    const coords = this._getTransformedMouseCoords();
    const col = this._getCol(coords.x);
    const row = this._getRow(coords.y);
    return (
      col >= 0 &&
      col < this.cols &&
      row >= 0 &&
      row < this.rows &&
      !this._cellIsOccupied(row, col)
    );
  }

  showWildcardSelector(placedLetter: Letter) {
    window.gameContext.wildcard = {
      letter: placedLetter,
      selecting: true,
    };
  }

  dropLetter(letter: Letter) {
    // Use transformed coordinates to place letter at correct grid position (accounts for zoom/pan)
    const coords = this._getTransformedMouseCoords();
    const col = this._getCol(coords.x);
    const row = this._getRow(coords.y);
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
    // Use transformed coordinates to find letter under cursor (accounts for zoom/pan)
    const coords = this._getTransformedMouseCoords();
    const col = this._getCol(coords.x);
    const row = this._getRow(coords.y);
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

  removeLetter(placedLetter: Letter) {
    this.liveLetters = this.liveLetters.filter((l) => l !== placedLetter);

    if (window.boardService && placedLetter) {
      window.boardService.removeLetter(placedLetter.row!, placedLetter.col!);
    }
  }

  finalizeMove() {
    let score = 0;
    let word: string | undefined = "";
    if (window.boardService && window.gameService) {
      word = this.getPlacedWord();
      // Scoring
      score = Array.from(window.boardService.getAllWords())
        .filter((word) => word.includeInScoring())
        .map((word) => word.getScore())
        .reduce((a, b) => a + b, 0);
      window.gameService.updateScore(score);
      window.boardService.finalizeMove();
      window.gameService.setLastWord(word!);
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
        window.boardService.removeLetter(placedLetter.row!, placedLetter.col!);
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
      const word = this.getPlacedWord()!;
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
