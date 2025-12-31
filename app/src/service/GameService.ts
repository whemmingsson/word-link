import { persistanceService } from "./PersistanceService";
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

  save() {
    persistanceService.save("playerOne", this.playerOne);
  }

  load() {
    const savedPlayer = persistanceService.load<Player>("playerOne");
    if (savedPlayer) {
      this.playerOne = savedPlayer;
    }
  }
}

// Singleton instance - created once on app load
export const gameService = new GameService();
