import { Grid } from "./grid";
import { Letterbar } from "./letterbar";
import { renderUtils } from "../utils/renderUtils";
import { styleUtils } from "../utils/styleUtils";
import { WildcardSelector } from "./wildcardSelector";
import { showMessage } from "./messageBox";
import { translate, translateFormatted } from "../utils/translationUtils";
import { ZoomController } from "./zoomController";
import {
  createElement,
  Check,
  RotateCcw,
  Shuffle,
  RefreshCw,
  Maximize2,
} from "lucide";

import P5 from "p5";

// Extend P5 type to include touch event handlers
interface P5WithTouch extends P5 {
  touchStarted?: ((event?: any) => boolean | void) | any;
  touchEnded?: ((event?: any) => boolean | void) | any;
  touchMoved?: ((event?: any) => boolean | void) | any;
}

interface TouchPoint {
  x: number;
  y: number;
}

interface DomElements {
  finishMoveButton: HTMLButtonElement | null;
  resetMoveButton: HTMLButtonElement | null;
  shuffleButton: HTMLButtonElement | null;
  switchButton: HTMLButtonElement | null;
  scoreLabel: HTMLSpanElement | null;
  lastWordLabel?: HTMLSpanElement | null;
  EXPERIMENTAL: {
    resetZoomButton: HTMLButtonElement | null;
  };
  startButton?: HTMLButtonElement | null;
}

const s = (p5: P5WithTouch) => {
  let grid: Grid;
  let bar: Letterbar;
  let wildcardSelector: WildcardSelector;
  let zoomController: ZoomController;
  let activeTouches: TouchPoint[] = []; // Track touch points for pinch zoom
  const margin = 20;
  let cellSize = 50;
  let gridTextSize = 16;
  let letterTileTextSize = 16;
  let letterTileScoreTextSize = 10;
  let coreServicesInitialized = false;
  let gameStarted = false;

  window.gameContext = {
    draggedLetter: null,
    dragSource: undefined,
    switchLetters: false,
    gridTextSize: gridTextSize,
    letterTileTextSize: letterTileTextSize,
    letterTileScoreTextSize: letterTileScoreTextSize,
    cellSize: cellSize,
    EXPERIMENTAL: {
      zoomEnabled: true,
    },
  };

  const DOM: DomElements = {
    finishMoveButton: null,
    resetMoveButton: null,
    shuffleButton: null,
    switchButton: null,
    scoreLabel: null,
    EXPERIMENTAL: {
      resetZoomButton: null,
    },
  };

  const calculateDynamicSizes = () => {
    // Use window width or body width, not canvas-wrapper which shrinks with the canvas
    const containerWidth = Math.min(
      window.innerWidth,
      document.body.clientWidth || window.innerWidth
    );

    // Calculate cell size based on grid (15x15) + margin
    const maxCellWidth = Math.floor((containerWidth - margin * 2) / 15);
    cellSize = Math.max(28, Math.min(60, maxCellWidth));

    window.gameContext.cellSize = Math.max(28, Math.min(60, maxCellWidth));
    window.gameContext.gridTextSize = Math.floor(cellSize * 0.4);
    window.gameContext.letterTileTextSize = Math.floor(cellSize * 0.5);
    window.gameContext.letterTileScoreTextSize = Math.floor(cellSize * 0.25);
  };

  const setupActionButtons = () => {
    // Create a button to finish the move
    DOM.finishMoveButton = createActionButton(
      "play",
      "finish-move-button",
      () => {
        if (!grid.hasPlacedAnyLetters()) {
          showMessage(translate("no_letters_placed"));
          return;
        }
        if (grid.isFirstMove() && !grid.isCenterCellOccupied()) {
          showMessage(translate("invalid_first_move"));
          return;
        }
        if (!grid.isValidPlacement()) {
          showMessage(translate("invalid_letter_placement"));
          return;
        }
        if (!grid.isValidWord()) {
          showMessage(
            translateFormatted("non_valid_word", grid.getPlacedWord()!)
          );
          return;
        }
        if (!grid.validateAllWords()) {
          showMessage(translate("invalid_words"));
          return;
        }

        const { score, word } = grid.finalizeMove();

        updateScoreBar(word!, score);

        bar.redrawLettersFromPool();
        bar.save();
      }
    );

    DOM.resetMoveButton = createActionButton(
      "reset",
      "reset-move-button",
      () => {
        // Move all live letters back to the letterbar
        grid.liveLetters.forEach((letter) => {
          bar.addLetter(letter);
        });
        grid.resetMove();
      }
    );

    // Create a button to shuffle letters in the letterbar
    DOM.shuffleButton = createActionButton(
      "shuffle",
      "shuffle-letters-button",
      () => {
        bar.shuffleLetters();
      }
    );

    // Create a button to switch out some letters in the letterbar
    DOM.switchButton = createActionButton(
      "switch_letters",
      "switch-letters-button",
      () => {
        if (!window.gameContext.switchLetters) {
          window.gameContext.switchLetters = true;
        } else {
          if (bar.hasMarkedLetters()) {
            bar.switchMarkedLetters();
          }
          window.gameContext.switchLetters = false;
        }
      }
    );

    // Score label
    DOM.scoreLabel = document.createElement("span");
    DOM.scoreLabel.id = "score-label";
    DOM.scoreLabel.innerText = translateFormatted("score_label", "0");
    document.getElementById("game-stats")?.appendChild(DOM.scoreLabel);

    // Last played word label (optional)
    DOM.lastWordLabel = document.createElement("span");
    DOM.lastWordLabel.id = "last-word-label";
    DOM.lastWordLabel.innerText = "";
    document.getElementById("game-stats")?.appendChild(DOM.lastWordLabel);

    // ZOOM CONTROLS - Zoom is now always enabled
    // Reset zoom button to return to default view
    DOM.EXPERIMENTAL.resetZoomButton = document.createElement("button");
    DOM.EXPERIMENTAL.resetZoomButton.id = "reset-zoom-button";
    DOM.EXPERIMENTAL.resetZoomButton.className = "icon-button";

    // Add icon and accessibility labels
    const zoomLabel = translate("reset_zoom");
    DOM.EXPERIMENTAL.resetZoomButton.setAttribute("aria-label", zoomLabel);
    DOM.EXPERIMENTAL.resetZoomButton.setAttribute("title", zoomLabel);
    const zoomIconElement = createElement(Maximize2, { "stroke-width": 2 });
    DOM.EXPERIMENTAL.resetZoomButton.appendChild(zoomIconElement);

    // Add text in a span for responsive display control via CSS
    const zoomTextSpan = document.createElement("span");
    zoomTextSpan.className = "button-text";
    zoomTextSpan.innerText = zoomLabel;
    DOM.EXPERIMENTAL.resetZoomButton.appendChild(zoomTextSpan);
    const resetZoomHandler = () => {
      zoomController.reset();
    };

    DOM.EXPERIMENTAL.resetZoomButton.onclick = resetZoomHandler;
    DOM.EXPERIMENTAL.resetZoomButton.ontouchend = (e) => {
      e.preventDefault();
      resetZoomHandler();
    };

    document
      .getElementById("actions")
      ?.appendChild(DOM.EXPERIMENTAL.resetZoomButton);

    // Create a start button to initiate the game
    DOM.startButton = document.createElement("button");
    DOM.startButton.innerText = translate("start_game");

    const startGameHandler = () => {
      if (!gameStarted) {
        startNewGame();
        showMessage(translate("game_started"), "info", 1500);
      } else {
        window.persistanceService.clear();
        window.location.reload();
      }
    };

    DOM.startButton.onclick = startGameHandler;
    DOM.startButton.ontouchend = (e) => {
      e.preventDefault();
      startGameHandler();
    };

    document.getElementById("game-controls")?.appendChild(DOM.startButton);

    // Set the width of game-controls to match the canvas
    document.getElementById(
      "game-controls"
    )!.style.width = `${grid.getWidth()}px`;
  };

  // Map action keys to Lucide icons for compact mobile display
  const ACTION_ICONS = {
    play: Check, // Finish move (checkmark)
    reset: RotateCcw, // Reset move (counter-clockwise arrow)
    shuffle: Shuffle, // Shuffle letters
    switch_letters: RefreshCw, // Switch letters (refresh)
  };

  const createActionButton = (
    text_key: keyof typeof ACTION_ICONS,
    id: string,
    eventHandler: () => void,
    disabled = true
  ) => {
    const button = document.createElement("button");
    button.id = id;
    button.disabled = disabled;
    button.className = "icon-button";

    // Set aria-label and title for accessibility using translated text
    const label = translate(text_key);
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);

    // Create icon element using Lucide's createElement for vanilla JS
    const IconComponent = ACTION_ICONS[text_key];
    if (IconComponent) {
      const iconElement = createElement(IconComponent, { "stroke-width": 2 });
      button.appendChild(iconElement);

      // Add text in a span for responsive display control via CSS
      const textSpan = document.createElement("span");
      textSpan.className = "button-text";
      textSpan.innerText = label;
      button.appendChild(textSpan);
    } else {
      // Fallback to text if no icon mapped
      button.innerText = label;
    }

    button.onclick = eventHandler;
    button.ontouchend = (e) => {
      e.preventDefault();
      eventHandler();
    };
    document.getElementById("actions")?.appendChild(button);
    return button;
  };

  const updateScoreBar = (word: string, score: number) => {
    if (!DOM.scoreLabel || !DOM.lastWordLabel) {
      return;
    }

    DOM.scoreLabel.innerText = translateFormatted(
      "score_label",
      window.gameService.getScore().toString()
    );
    DOM.lastWordLabel.innerText = translateFormatted(
      "last_word",
      word,
      String(score)
    );
  };

  p5.setup = function () {
    calculateDynamicSizes(); // Calculate responsive cell size

    grid = new Grid(p5, 15, 15, cellSize);
    bar = new Letterbar(p5, 0, grid.getHeight() + margin, grid.getWidth());

    p5.createCanvas(
      grid.getWidth(),
      grid.getHeight() + bar.getHeight() + margin
    ).parent("canvas-wrapper");

    // Must be after createCanvas to ensure width/height are defined
    wildcardSelector = new WildcardSelector(p5);

    zoomController = new ZoomController(p5);
    // Store zoom controller in gameContext so Grid can access it for coordinate transformations
    window.gameContext.zoomController = zoomController;

    setupActionButtons();

    p5.textAlign(p5.CENTER, p5.CENTER);

    showMessage("P5 setup complete!", "info", 2000);

    // Manually register touch events on the canvas element
    // This is needed because p5.js npm version may not auto-register touch events
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener(
        "touchstart",
        () => {
          if (p5.touchStarted && typeof p5.touchStarted === "function") {
            (p5.touchStarted as any).call(p5);
          }
        },
        { passive: false }
      );

      canvas.addEventListener(
        "touchend",
        () => {
          if (p5.touchEnded && typeof p5.touchEnded === "function") {
            (p5.touchEnded as any).call(p5);
          }
        },
        { passive: false }
      );

      canvas.addEventListener(
        "touchmove",
        () => {
          if (p5.touchMoved && typeof p5.touchMoved === "function") {
            (p5.touchMoved as any).call(p5);
          }
        },
        { passive: false }
      );
    }

    if (window.persistanceService) {
      const gameStartedSaved = window.persistanceService.load("gameStarted");
      if (gameStartedSaved) {
        loadSavedGame();
      }
    }

    console.log("[main] p5 setup complete");
  };

  const startNewGame = () => {
    if (!window.persistanceService) {
      console.error(
        "[main] PersistanceService not available. Cannot start new game."
      );
      return;
    }
    window.persistanceService.clear();

    bar.init();
    bar.save();

    window.persistanceService.save("gameStarted", true);

    gameStarted = true;
    if (DOM.startButton) {
      DOM.startButton.innerText = translate("abort_game");
    }
  };

  const loadSavedGame = () => {
    if (!window.persistanceService) {
      console.error(
        "[main] PersistanceService not available. Cannot load saved game."
      );
      return;
    }

    console.log("[main] Loading saved game...");

    grid.load();
    bar.load();

    if (window.gameService) {
      window.gameService.load();
    } else {
      console.error(
        "[main] GameService not available. Cannot load saved game score."
      );
    }

    updateScoreBar(
      window.gameService ? window.gameService.getLastWord() : "",
      0
    );

    gameStarted = true;
    if (DOM.startButton) {
      DOM.startButton.innerText = translate("abort_game");
    }
  };

  p5.draw = function () {
    if (!coreServicesInitialized) {
      if (window.servicesReady) {
        coreServicesInitialized = true;
        console.log(
          "[main] Core Services are ready. Starting draw loop. Game on =)"
        );
      } else {
        return; // Wait until services are ready
      }
    }

    if (!window.p5) {
      // We cannot start the draw loop without p5 being available
      console.error("[main] p5 instance not available.");
      return;
    }

    p5.background(styleUtils.sketch.backgroundColor);
    p5.push(); // Save transform state
    if (window.gameContext.EXPERIMENTAL.zoomEnabled) {
      zoomController.applyTransform();
    }
    grid.render();
    p5.pop(); // Restore transform

    bar.render();

    if (window.gameContext.draggedLetter) {
      // TODO: Fix this mess
      renderUtils.renderDraggedTile(
        {
          ...window.gameContext.draggedLetter,
          col: window.gameContext.draggedLetter.col!,
          row: window.gameContext.draggedLetter.row!,
          isLive: true,
        },
        bar.tileCellSize
      );
    }

    if (window.gameContext.switchLetters) {
      grid.renderOverlay();
    }

    if (!gameStarted) {
      return;
    }

    handleCursorStyle(p5);
    renderWildcardSelector();
    handleDom();
  };

  const handleCursorStyle = (p5: P5) => {
    const mouseOverBarLetter = bar.getLetterAtMousePosition() !== null;
    const gridLetter = grid.getMouseOverLetter();
    const mouseOverLiveGridLetter = gridLetter && gridLetter.isLive;

    if (mouseOverBarLetter || mouseOverLiveGridLetter) {
      p5.cursor(p5.HAND);
    } else {
      p5.cursor(p5.ARROW);
    }
  };

  const renderWildcardSelector = () => {
    if (!window.gameContext.wildcard?.selecting) {
      return;
    }
    wildcardSelector.render();
  };

  const setIfValueChanged = (obj: any, key: string, newValue: any) => {
    if (obj && obj[key] !== newValue) {
      obj[key] = newValue;
    }
  };

  const handleDom = () => {
    const hasPlacedLetters = grid.hasPlacedAnyLetters();

    setIfValueChanged(DOM.finishMoveButton, "disabled", !hasPlacedLetters);
    setIfValueChanged(DOM.resetMoveButton, "disabled", !hasPlacedLetters);
    setIfValueChanged(
      DOM.shuffleButton,
      "disabled",
      window.gameContext.switchLetters
    );
    setIfValueChanged(DOM.switchButton, "disabled", hasPlacedLetters);

    // Update switch button text when toggling between switch and confirm modes
    const switchTextSpan: HTMLElement | null =
      DOM.switchButton!.querySelector(".button-text");
    if (window.gameContext.switchLetters) {
      const confirmText = translate("confirm_switch");
      if (switchTextSpan && switchTextSpan.innerText !== confirmText) {
        switchTextSpan.innerText = confirmText;
        DOM.switchButton?.setAttribute("aria-label", confirmText);
        DOM.switchButton?.setAttribute("title", confirmText);
      }
    } else {
      const switchText = translate("switch_letters");
      if (switchTextSpan && switchTextSpan.innerText !== switchText) {
        switchTextSpan.innerText = switchText;
        DOM.switchButton?.setAttribute("aria-label", switchText);
        DOM.switchButton?.setAttribute("title", switchText);
      }
    }
  };

  // Handle window resize
  p5.windowResized = function () {
    calculateDynamicSizes();
    grid.cellSize = cellSize;
    bar.y = grid.getHeight() + margin;
    bar.width = grid.getWidth();
    bar.updateTileCellSize();

    p5.resizeCanvas(
      grid.getWidth(),
      grid.getHeight() + bar.getHeight() + margin
    );

    // Update game-controls width to match canvas
    const gameControlsElement = document.getElementById("game-controls");
    if (gameControlsElement) {
      gameControlsElement.style.width = `${grid.getWidth()}px`;
    }
  };

  p5.mousePressed = function () {
    if (window.gameContext.wildcard?.selecting) {
      handleSelectedWildcardLetter();
      return;
    }

    if (window.gameContext.switchLetters) {
      handleSwitchLetters();
      return;
    }

    if (bar.mouseIsOver() && !window.gameContext.draggedLetter) {
      handleBeginDragFromBar();
      return;
    }

    if (grid.mouseIsOver() && !window.gameContext.draggedLetter) {
      handleBeginDragFromGrid();
      return;
    }
  };

  const handleSelectedWildcardLetter = () => {
    const letter = wildcardSelector.getSelectedLetter();
    if (letter) {
      window.gameContext.wildcard!.letter.letter = letter;
      window.boardService.updateLetterAt(
        window.gameContext.wildcard!.letter.row!,
        window.gameContext.wildcard!.letter.col!,
        window.gameContext.wildcard!.letter
      );
      window.gameContext.wildcard = undefined;
    }
  };

  const handleSwitchLetters = () => {
    const letterToToggle = bar.getLetterAtMousePosition();
    if (letterToToggle) {
      const index = bar.letters.indexOf(letterToToggle);
      if (index >= 0) {
        bar.toggleMarkLetterAtIndex(index);
      }
    }
  };

  const handleBeginDragFromBar = () => {
    const barLetter = bar.getLetterAtMousePosition();
    if (barLetter) {
      window.gameContext.draggedLetter = barLetter;
      window.gameContext.dragSource = "bar";
    }
  };

  const handleBeginDragFromGrid = () => {
    const gridLetter = grid.getMouseOverLetter();
    if (gridLetter) {
      window.gameContext.draggedLetter = gridLetter;
      window.gameContext.dragSource = "grid";
    }
  };

  p5.mouseReleased = function () {
    if (window.gameContext.draggedLetter) {
      if (window.gameContext.dragSource === "bar") {
        handleEndDragFromBar();
      } else if (window.gameContext.dragSource === "grid") {
        handleEndDragFromGrid();
      }

      window.gameContext.draggedLetter = null;
      window.gameContext.dragSource = undefined;
    }
  };

  const handleEndDragFromBar = () => {
    const letter = window.gameContext.draggedLetter;
    if (letter && grid.canDropLetter() && grid.dropLetter(letter)) {
      bar.removeLetter(letter);
    }
  };

  const handleEndDragFromGrid = () => {
    const letter = window.gameContext.draggedLetter;
    if (!letter) {
      return;
    }

    if (bar.mouseIsOver()) {
      bar.addLetter(letter);
      grid.removeLetter(letter);
    } else if (grid.canDropLetter()) {
      grid.removeLetter(letter);
      grid.dropLetter(letter);
    }
  };

  // Mouse wheel zoom
  p5.mouseWheel = function (event) {
    if (
      grid.mouseIsOver() &&
      window.gameContext.EXPERIMENTAL.zoomEnabled &&
      event &&
      event.deltaY
    ) {
      zoomController.handleZoom(event.deltaY, p5.mouseX, p5.mouseY);
      return false;
    }
  };

  p5.touchStarted = function (this: any) {
    activeTouches = [...this.touches] as TouchPoint[];
    if (
      activeTouches.length === 2 &&
      window.gameContext.EXPERIMENTAL.zoomEnabled
    ) {
      return false;
    }
    // Manually trigger mouse pressed logic for single touch
    if (p5.mousePressed && typeof p5.mousePressed === "function") {
      p5.mousePressed.call(this);
    }
    return false;
  } as any;

  p5.touchEnded = function (this: any) {
    if (
      activeTouches.length === 2 &&
      window.gameContext.EXPERIMENTAL.zoomEnabled
    ) {
      activeTouches = [];
      return false;
    }
    activeTouches = [];
    // Manually trigger mouse released logic
    if (p5.mouseReleased && typeof p5.mouseReleased === "function") {
      p5.mouseReleased.call(this);
    }
    return false;
  } as any;

  p5.touchMoved = function (this: any) {
    if (
      activeTouches.length === 2 &&
      window.gameContext.EXPERIMENTAL.zoomEnabled
    ) {
      const newTouches = [...this.touches] as TouchPoint[];
      if (newTouches.length !== 2) {
        return false;
      }

      const oldDist = this.dist(
        activeTouches[0].x,
        activeTouches[0].y,
        activeTouches[1].x,
        activeTouches[1].y
      );
      const newDist = this.dist(
        newTouches[0].x,
        newTouches[0].y,
        newTouches[1].x,
        newTouches[1].y
      );

      const zoomDelta = (newDist - oldDist) * 2;

      const centerX = (newTouches[0].x + newTouches[1].x) / 2;
      const centerY = (newTouches[0].y + newTouches[1].y) / 2;

      zoomController.handleZoom(-zoomDelta, centerX, centerY);
      activeTouches = newTouches;
      return false;
    }
    if (window.gameContext.draggedLetter) {
      return false;
    }
  } as any;
};

let myp5 = new P5(s);
window.p5 = myp5 as any;
console.log("[main] p5 instance created");
