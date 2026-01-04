import type { DictionaryService } from "../service/DictionaryService";
import type { LetterPoolService } from "../service/LetterPoolService";
import type { BoardService } from "../service/BoardService";
import type { GridConfigService } from "../service/GridConfigService";
import type { TranslationService } from "../service/TranslationService";
import type { GameService } from "../service/GameService";
import type { PersistanceService } from "../service/PersistanceService";
import type { GameContext } from "./GameContext.ts";

declare global {
  interface Window {
    // Services
    dictionaryService: DictionaryService;
    letterPoolService: LetterPoolService;
    boardService: BoardService;
    gridConfigService: GridConfigService;
    translationService: TranslationService;
    gameService: GameService;
    persistanceService: PersistanceService;

    // Game context
    gameContext: GameContext;

    // Service ready flag
    servicesReady: boolean;

    // p5.js globals
    mouseX: number;
    mouseY: number;
    mouseIsPressed: boolean;
  }

  // p5.js global functions used in the application
  function translate(x: number, y: number): void;
  function scale(s: number): void;
  function scale(x: number, y: number): void;
  function constrain(n: number, low: number, high: number): number;
}

export {};
