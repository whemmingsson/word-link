import type { LetterTile } from "../../../common/types/LetterTile";

export class BoardService {
  board: LetterTile[][];
  letters: { letter: string; row: number; col: number; value: number }[];
  constructor() {
    this.board = [];
    this.letters = [];
    console.log("BoardService initialized.");
    this.initializeBoard();
  }

  initializeBoard() {
    this.board = Array.from({ length: 15 }, () =>
      Array.from({ length: 15 }, () => ({ letter: "", value: 0 }))
    );
  }

  placeLetter(row: number, col: number, letter: LetterTile): boolean {
    if (this.board[row][col].letter === "") {
      this.board[row][col] = letter;
      this.letters.push({
        letter: letter.letter,
        row,
        col,
        value: letter.value,
      });
      return true;
    }
    return false;
  }

  getBoardState(): LetterTile[][] {
    return this.board;
  }

  getPlacedLetters() {
    return this.letters;
  }

  finalizeMove() {
    console.log("Finalizing move with letters:", this.letters);
    // Here you would add logic to validate the move, update scores, etc.
    // For now, we just clear the placed letters for the next turn.
    this.letters = [];
  }

  removeLetter(row: number, col: number) {
    const letterIndex = this.letters.findIndex(
      (l) => l.row === row && l.col === col
    );
    if (letterIndex >= 0) {
      this.letters.splice(letterIndex, 1);
      this.board[row][col] = { letter: "", value: 0 };
    }
  }
}

export const boardService = new BoardService();
