import { gridConfigService } from "./GridConfigService";
import { persistanceService } from "./PersistanceService";

interface PlacedLetter {
  id: number;
  letter: string;
  row: number;
  col: number;
  value: number;
  isLive: boolean;
  wildCard?: boolean;
}

const getLetterValueMultiplier = (letter: PlacedLetter): number => {
  if (letter.wildCard) return 1;
  if (!letter.isLive) return 1;
  return gridConfigService.getLetterMultiplierAt(letter.col, letter.row);
};

export class Word {
  letters: PlacedLetter[];

  constructor(letters: PlacedLetter[]) {
    this.letters = letters;
  }

  _getTotalWordMultiplier(): number {
    return this.letters
      .filter((l) => l.isLive)
      .reduce((acc, letter) => {
        const wordMultiplier = gridConfigService.getWordMultiplierAt(
          letter.col,
          letter.row
        );
        return acc * wordMultiplier;
      }, 1);
  }

  getWord(): string {
    return this.letters.map((l) => l.letter).join("");
  }

  getScore(): number {
    return (
      this.letters.reduce(
        (acc, letter) => acc + letter.value * getLetterValueMultiplier(letter),
        0
      ) * this._getTotalWordMultiplier()
    );
  }

  includeInScoring() {
    return this.letters.some((l) => l.isLive);
  }
}

export class BoardService {
  board: (PlacedLetter | null)[][];
  letters: PlacedLetter[];
  liveLetters: PlacedLetter[];
  constructor() {
    this.board = [];
    this.letters = [];
    this.liveLetters = [];
    console.log("[core service] BoardService initialized.");
    this.initializeBoard();
  }

  initializeBoard() {
    this.board = Array.from({ length: 15 }, () =>
      Array.from({ length: 15 }, () => null)
    );
  }

  _scoreWord(): number {
    if (!this.liveLetters.length) return 0;
    return this.liveLetters.reduce((acc, letter) => acc + letter.value, 0);
  }

  _getNewWord() {
    if (this.liveLetters.length === 0) return "";

    // Special case: if there's only 1 live letter, determine direction by checking for adjacent letters
    if (this.liveLetters.length === 1) {
      const letter = this.liveLetters[0];
      const row = letter.row;
      const col = letter.col;

      // Check for horizontal adjacent letters (left or right)
      const hasHorizontalAdjacent =
        (col > 0 && this.board[row][col - 1] !== null) ||
        (col < 14 && this.board[row][col + 1] !== null);

      // Check for vertical adjacent letters (up or down)
      const hasVerticalAdjacent =
        (row > 0 && this.board[row - 1][col] !== null) ||
        (row < 14 && this.board[row + 1][col] !== null);

      // Determine direction based on adjacent letters
      // If both directions have adjacent letters, prefer vertical (but this shouldn't happen in valid placement)
      const shouldExpandVertically = hasVerticalAdjacent;
      const shouldExpandHorizontally =
        hasHorizontalAdjacent && !hasVerticalAdjacent;

      if (shouldExpandHorizontally) {
        // Force horizontal expansion
        let minCol = col;
        let maxCol = col;

        while (minCol > 0 && this.board[row][minCol - 1] !== null) {
          minCol--;
        }
        while (maxCol < 14 && this.board[row][maxCol + 1] !== null) {
          maxCol++;
        }

        const wordLetters: PlacedLetter[] = [];
        for (let c = minCol; c <= maxCol; c++) {
          const l = this.board[row][c];
          if (l) wordLetters.push(l);
        }
        return wordLetters.map((l) => l.letter).join("");
      } else if (shouldExpandVertically) {
        // Force vertical expansion
        let minRow = row;
        let maxRow = row;

        while (minRow > 0 && this.board[minRow - 1][col] !== null) {
          minRow--;
        }
        while (maxRow < 14 && this.board[maxRow + 1][col] !== null) {
          maxRow++;
        }

        const wordLetters: PlacedLetter[] = [];
        for (let r = minRow; r <= maxRow; r++) {
          const l = this.board[r][col];
          if (l) wordLetters.push(l);
        }
        return wordLetters.map((l) => l.letter).join("");
      } else {
        // No adjacent letters - just return the single letter
        return letter.letter;
      }
    }

    // Determine if word is horizontal (same row) or vertical (same column)
    const allSameRow = this.liveLetters.every(
      (l) => l.row === this.liveLetters[0].row
    );

    let wordLetters: PlacedLetter[] = [];

    if (allSameRow) {
      // Horizontal word
      const row = this.liveLetters[0].row;
      const sorted = [...this.liveLetters].sort((a, b) => a.col - b.col);
      let minCol = sorted[0].col;
      let maxCol = sorted[sorted.length - 1].col;

      // Expand left to find the start of the word
      while (minCol > 0 && this.board[row][minCol - 1] !== null) {
        minCol--;
      }

      // Expand right to find the end of the word
      while (maxCol < 14 && this.board[row][maxCol + 1] !== null) {
        maxCol++;
      }

      // Collect all letters from minCol to maxCol
      for (let col = minCol; col <= maxCol; col++) {
        const letter = this.board[row][col];
        if (letter) {
          wordLetters.push(letter);
        }
      }
    } else {
      // Vertical word
      const col = this.liveLetters[0].col;
      const sorted = [...this.liveLetters].sort((a, b) => a.row - b.row);
      let minRow = sorted[0].row;
      let maxRow = sorted[sorted.length - 1].row;

      // Expand up to find the start of the word
      while (minRow > 0 && this.board[minRow - 1][col] !== null) {
        minRow--;
      }

      // Expand down to find the end of the word
      while (maxRow < 14 && this.board[maxRow + 1][col] !== null) {
        maxRow++;
      }

      // Collect all letters from minRow to maxRow
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
    this.letters.forEach((l) => (l.isLive = false));
    this.liveLetters = [];
    persistanceService.save("boardState", this.letters);
  }

  load() {
    const savedLetters = persistanceService.load<PlacedLetter[]>("boardState");
    if (savedLetters) {
      this.letters = savedLetters;
      this.initializeBoard();
      this.letters.forEach((letter) => {
        this.board[letter.row][letter.col] = letter;
      });
    }
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

  getAllWords(): Set<Word> {
    const words = new Set<Word>();

    // Scan horizontally (left to right)
    for (let row = 0; row < 15; row++) {
      let currentWord: PlacedLetter[] = [];

      for (let col = 0; col < 15; col++) {
        const letter = this.board[row][col];

        if (letter !== null) {
          currentWord.push(letter);
        } else {
          // Empty cell - finalize current word if it has 2+ letters
          if (currentWord.length >= 2) {
            words.add(new Word(currentWord));
          }
          currentWord = [];
        }
      }

      // End of row - finalize current word if it has 2+ letters
      if (currentWord.length >= 2) {
        words.add(new Word(currentWord));
      }
    }

    // Scan vertically (top to bottom)
    for (let col = 0; col < 15; col++) {
      let currentWord: PlacedLetter[] = [];

      for (let row = 0; row < 15; row++) {
        const letter = this.board[row][col];

        if (letter !== null) {
          currentWord.push(letter);
        } else {
          // Empty cell - finalize current word if it has 2+ letters
          if (currentWord.length >= 2) {
            words.add(new Word(currentWord));
          }
          currentWord = [];
        }
      }

      // End of column - finalize current word if it has 2+ letters
      if (currentWord.length >= 2) {
        words.add(new Word(currentWord));
      }
    }

    return words;
  }

  isFirstMove(): boolean {
    return this.letters.filter((l) => !l.isLive).length === 0;
  }
}

export const boardService = new BoardService();
