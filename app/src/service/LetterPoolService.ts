import { getLetterPool } from "../config/letterConfig";
import type { LetterTile } from "d:/Projects/word-link/common/types/LetterTile";

export class LetterPoolService {
  letterPool: LetterTile[];

  constructor() {
    this.letterPool = getLetterPool();
    console.log("LetterPoolService initialized with letter pool.");
  }

  drawLetters(count: number): LetterTile[] {
    const drawnLetters: LetterTile[] = [];
    const poolCopy = [...this.letterPool];
    for (let i = 0; i < count; i++) {
      if (poolCopy.length === 0) break;
      const randomIndex = Math.floor(Math.random() * poolCopy.length);
      drawnLetters.push(poolCopy.splice(randomIndex, 1)[0]);
    }

    // ONLY FOR DEBUG - ADD THE WILDCARD
    drawnLetters.push({
      letter: "*",
      value: 0,
      id: Math.random() * 100000 + 99999,
      wildCard: true,
    });
    return drawnLetters;
  }

  getValueOfLetter(letter: string): number {
    const letterTile = this.letterPool.find((lt) => lt.letter === letter);
    return letterTile ? letterTile.value : 0;
  }
}

// Singleton instance - created once on app load
export const letterPoolService = new LetterPoolService();
