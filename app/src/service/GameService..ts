interface Player {
  id: string;
  name: string;
  score: number;
  lastWord?: string;
}

export class GameService {
  playerOne: Player;
  constructor() {
    this.playerOne = { id: "0", name: "Player 1", score: 0 };
  }

  updateScore(score: number) {
    this.playerOne.score += score;
  }

  setLastWord(word: string) {
    this.playerOne.lastWord = word;
  }

  getScore() {
    return this.playerOne.score;
  }

  getLastWord() {
    return this.playerOne.lastWord || "";
  }
}

// Singleton instance - created once on app load
export const gameService = new GameService();
