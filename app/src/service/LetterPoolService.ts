import { getLetterPool } from "../config/letterConfig";
import type { LetterTile } from "../types/LetterTile";
import { persistanceService } from "./PersistanceService";

export class LetterPoolService {
  letterPool: LetterTile[];

  constructor() {
    this.letterPool = getLetterPool();
    console.log(
      "[core service] LetterPoolService initialized with letter pool."
    );
  }

  init() {
    this.letterPool = getLetterPool();
  }

  save() {
    persistanceService.save("letterPool", this.letterPool);
  }

  load() {
    const savedPool = persistanceService.load<LetterTile[]>("letterPool");
    if (savedPool) {
      this.letterPool = savedPool;
    }
  }

  drawLetters(count: number): LetterTile[] {
    const drawnLetters: LetterTile[] = [];
    const poolCopy = [...this.letterPool];
    for (let i = 0; i < count; i++) {
      if (poolCopy.length === 0) break;
      const randomIndex = Math.floor(Math.random() * poolCopy.length);
      drawnLetters.push(poolCopy.splice(randomIndex, 1)[0]);
    }
    return drawnLetters;
  }

  getValueOfLetter(letter: string): number {
    const letterTile = this.letterPool.find((lt) => lt.letter === letter);
    return letterTile ? letterTile.value : 0;
  }

  switchLetters(lettersToSwitch: LetterTile[]): LetterTile[] {
    const newLetters: LetterTile[] = [];
    const poolCopy = [...this.letterPool];
    lettersToSwitch.forEach(() => {
      if (poolCopy.length === 0) return;
      const randomIndex = Math.floor(Math.random() * poolCopy.length);
      newLetters.push(poolCopy.splice(randomIndex, 1)[0]);
    });
    return newLetters;
  }
}

// Singleton instance - created once on app load
export const letterPoolService = new LetterPoolService();
