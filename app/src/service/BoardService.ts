interface PlacedLetter {
  id: number;
  letter: string;
  row: number;
  col: number;
  value: number;
  isLive: boolean;
}

export class BoardService {
  board: (PlacedLetter | null)[][];
  letters: PlacedLetter[];
  constructor() {
    this.board = [];
    this.letters = [];
    console.log("BoardService initialized.");
    this.initializeBoard();
  }

  initializeBoard() {
    this.board = Array.from({ length: 15 }, () =>
      Array.from({ length: 15 }, () => null)
    );
  }

  placeLetter(letter: PlacedLetter): boolean {
    if (this.board[letter.row][letter.col] === null) {
      this.board[letter.row][letter.col] = letter;
      this.letters.push(letter);
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
    console.log("Finalizing move with letters:", this.letters);
    this.letters.forEach((l) => (l.isLive = false));
  }

  removeLetter(row: number, col: number) {
    const letterIndex = this.letters.findIndex(
      (l) => l.row === row && l.col === col
    );
    if (letterIndex >= 0) {
      this.letters.splice(letterIndex, 1);
      this.board[row][col] = null;
    }
  }

  updateLetterAt(row: number, col: number, newLetter: PlacedLetter) {
    const letter = this.board[row][col];
    if (letter) {
      letter.letter = newLetter.letter;
    }
  }
}

export const boardService = new BoardService();
