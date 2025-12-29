interface PlacedLetter {
  id: number;
  letter: string;
  row: number;
  col: number;
  value: number;
  isLive: boolean;
  wildCard?: boolean;
}

export class BoardService {
  board: (PlacedLetter | null)[][];
  letters: PlacedLetter[];
  liveLetters: PlacedLetter[];
  constructor() {
    this.board = [];
    this.letters = [];
    this.liveLetters = [];
    console.log("BoardService initialized.");
    this.initializeBoard();
  }

  initializeBoard() {
    this.board = Array.from({ length: 15 }, () =>
      Array.from({ length: 15 }, () => null)
    );
  }

  _getNewWord() {
    if (this.liveLetters.length === 0) return "";

    // Determine if word is horizontal (same row) or vertical (same column)
    const allSameRow = this.liveLetters.every(
      (l) => l.row === this.liveLetters[0].row
    );

    let wordLetters: PlacedLetter[] = [];

    if (allSameRow) {
      // Horizontal word - sort by column (left to right)
      const row = this.liveLetters[0].row;
      const sorted = [...this.liveLetters].sort((a, b) => a.col - b.col);
      const minCol = sorted[0].col;
      const maxCol = sorted[sorted.length - 1].col;

      // Collect all letters from minCol to maxCol (includes live + at most 1 placed)
      for (let col = minCol; col <= maxCol; col++) {
        const letter = this.board[row][col];
        if (letter) {
          wordLetters.push(letter);
        }
      }
    } else {
      // Vertical word - sort by row (top to bottom)
      const col = this.liveLetters[0].col;
      const sorted = [...this.liveLetters].sort((a, b) => a.row - b.row);
      const minRow = sorted[0].row;
      const maxRow = sorted[sorted.length - 1].row;

      // Collect all letters from minRow to maxRow (includes live + at most 1 placed)
      for (let row = minRow; row <= maxRow; row++) {
        const letter = this.board[row][col];
        if (letter) {
          wordLetters.push(letter);
        }
      }
    }

    // Join the letters in correct order to form the word
    return wordLetters.map((l) => l.letter).join("");
  }

  isValidPlacement() {
    // Rule 1: Must have at least one live letter
    if (this.liveLetters.length === 0) return false;

    // Rule 2: All live letters must be in the same row OR the same column
    const allSameRow = this.liveLetters.every(
      (l) => l.row === this.liveLetters[0].row
    );
    const allSameCol = this.liveLetters.every(
      (l) => l.col === this.liveLetters[0].col
    );

    if (!allSameRow && !allSameCol) return false;

    // Rule 3: All letters must be adjacent (continuous sequence)
    // This means no empty cells between the first and last letter position
    // Existing (non-live) letters can fill gaps between live letters

    if (allSameRow) {
      // Sort by column position
      const sorted = [...this.liveLetters].sort((a, b) => a.col - b.col);
      const row = sorted[0].row;
      const minCol = sorted[0].col;
      const maxCol = sorted[sorted.length - 1].col;

      // Check that all positions between min and max are occupied
      for (let col = minCol; col <= maxCol; col++) {
        if (this.board[row][col] === null) {
          return false; // Gap found - letters are not adjacent
        }
      }
    } else {
      // All same column - sort by row position
      const sorted = [...this.liveLetters].sort((a, b) => a.row - b.row);
      const col = sorted[0].col;
      const minRow = sorted[0].row;
      const maxRow = sorted[sorted.length - 1].row;

      // Check that all positions between min and max are occupied
      for (let row = minRow; row <= maxRow; row++) {
        if (this.board[row][col] === null) {
          return false; // Gap found - letters are not adjacent
        }
      }
    }

    // Rule 4: If not the first move, at least one live letter must be adjacent to an existing (non-live) letter
    // First move check: if all letters on the board are live, it's the first move
    const isFirstMove = this.letters.filter((l) => !l.isLive).length === 0;

    if (!isFirstMove) {
      // Not the first move - check if any live letter is adjacent to a placed letter
      let hasAdjacentPlacedLetter = false;

      for (const liveLetter of this.liveLetters) {
        // Check all 4 adjacent cells (up, down, left, right)
        const adjacentPositions = [
          { row: liveLetter.row - 1, col: liveLetter.col }, // Up
          { row: liveLetter.row + 1, col: liveLetter.col }, // Down
          { row: liveLetter.row, col: liveLetter.col - 1 }, // Left
          { row: liveLetter.row, col: liveLetter.col + 1 }, // Right
        ];

        for (const pos of adjacentPositions) {
          // Check bounds
          if (pos.row >= 0 && pos.row < 15 && pos.col >= 0 && pos.col < 15) {
            const adjacentLetter = this.board[pos.row][pos.col];
            // Check if there's a letter and it's not live (i.e., it's placed)
            if (adjacentLetter && !adjacentLetter.isLive) {
              hasAdjacentPlacedLetter = true;
              break;
            }
          }
        }

        if (hasAdjacentPlacedLetter) break;
      }

      if (!hasAdjacentPlacedLetter) {
        return false; // No live letter is adjacent to an existing placed letter
      }
    }

    return true;
  }

  placeLetter(letter: PlacedLetter): boolean {
    if (this.board[letter.row][letter.col] === null) {
      this.board[letter.row][letter.col] = letter;
      this.letters.push(letter);
      this.liveLetters.push(letter);
      return true;
    }
    return false;
  }

  getBoardState(): (PlacedLetter | null)[][] {
    return this.board;
  }

  getPlacedLetters(): PlacedLetter[] {
    return this.letters;
  }

  cellIsOccupied(row: number, col: number): boolean {
    return this.board[row][col] !== null;
  }

  finalizeMove() {
    const word = this._getNewWord();
    console.log(
      "Finalizing move with letters:",
      this.liveLetters,
      "forming word:",
      word
    );
    this.letters.forEach((l) => (l.isLive = false));
    this.liveLetters = [];
  }

  removeLetter(row: number, col: number) {
    const letterIndex = this.letters.findIndex(
      (l) => l.row === row && l.col === col
    );
    if (letterIndex >= 0) {
      this.letters.splice(letterIndex, 1);
      this.liveLetters = this.liveLetters.filter(
        (l) => !(l.row === row && l.col === col)
      );
      this.board[row][col] = null;
    }
  }

  updateLetterAt(row: number, col: number, newLetter: PlacedLetter) {
    const letter = this.board[row][col];
    if (letter) {
      letter.letter = newLetter.letter;
    }
  }

  getPlacedWord(): string {
    return this._getNewWord();
  }
}

export const boardService = new BoardService();
