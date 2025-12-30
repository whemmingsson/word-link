import { Grid } from "./grid.js";
import { Letterbar } from "./letterbar.js";
import { renderUtils } from "./renderUtils.js";
import { styleUtils } from "./styleUtils.js";
import { WildcardSelector } from "./wildcardSelector.js";
import { showMessage } from "./messageBox.js";
import { translate, translateFormatted } from "./translationUtils.js";

let grid;
let bar;
let wildcardSelector;
const margin = 20;
let cellSize = 50;
let gridTextSize = 16;
let letterTileTextSize = 16;
let letterTileScoreTextSize = 10;
let initialized = false;

window.gameContext = {};
window.gameContext.draggedLetter = false;
// Size of each cell in pixels
window.gameContext.cellSize = cellSize;
// Text size for special tiles displayed on the grid
window.gameContext.gridTextSize = gridTextSize;
// Text size for letters displayed on letter tiles
window.gameContext.letterTileTextSize = letterTileTextSize;
// Text size for score displayed on letter tiles
window.gameContext.letterTileScoreTextSize = letterTileScoreTextSize;

const DOM = {
  finishMoveButton: null,
  resetMoveButton: null,
  shuffleButton: null,
  switchButton: null,
  scoreLabel: null,
};

const calculateDynamicSizes = () => {
  const containerWidth =
    document.getElementById("canvas-wrapper").clientWidth || window.innerWidth;

  // Calculate cell size based on grid (15x15) + margin
  const maxCellWidth = Math.floor((containerWidth - margin * 2) / 15);

  cellSize = Math.max(28, Math.min(60, maxCellWidth));
  window.gameContext.cellSize = cellSize;
  gridTextSize = Math.floor(cellSize * 0.4);
  window.gameContext.gridTextSize = gridTextSize;
  letterTileTextSize = Math.floor(cellSize * 0.32);
  window.gameContext.letterTileTextSize = letterTileTextSize;
  letterTileScoreTextSize = Math.floor(cellSize * 0.2);
  window.gameContext.letterTileScoreTextSize = letterTileScoreTextSize;
};

const setupActionButtons = () => {
  // Create a button to finish the move
  DOM.finishMoveButton = document.createElement("button");
  DOM.finishMoveButton.innerText = translate("play");

  const finishMoveHandler = () => {
    if (!grid.hasPlacedAnyLetters()) {
      showMessage(translate("no_letters_placed"));
      return;
    }
    if (!grid.isValidPlacement()) {
      showMessage(translate("invalid_letter_placement"));
      return;
    }
    if (!grid.isValidWord()) {
      showMessage(translateFormatted("non_valid_word", grid.getPlacedWord()));
      return;
    }
    if (!grid.validateAllWords()) {
      showMessage(translate("invalid_words"));
      return;
    }

    const { score, word } = grid.finalizeMove();
    DOM.scoreLabel.innerText = translateFormatted("score_label", score);
    DOM.lastWordLabel.innerText = translateFormatted("last_word", word);
    const newLetters = window.letterPoolService.drawLetters(
      7 - bar.letters.length
    );
    bar.letters.push(...newLetters);
  };

  DOM.finishMoveButton.onclick = finishMoveHandler;
  DOM.finishMoveButton.ontouchend = (e) => {
    e.preventDefault();
    finishMoveHandler();
  };

  document.getElementById("actions").appendChild(DOM.finishMoveButton);

  // Create a button to reset the placed live letters
  DOM.resetMoveButton = document.createElement("button");
  DOM.resetMoveButton.innerText = translate("reset");

  const resetHandler = () => {
    // Move all live letters back to the letterbar
    grid.liveLetters.forEach((letter) => {
      bar.addLetter(letter);
    });
    grid.resetMove();
  };

  DOM.resetMoveButton.onclick = resetHandler;
  DOM.resetMoveButton.ontouchend = (e) => {
    e.preventDefault();
    resetHandler();
  };

  document.getElementById("actions").appendChild(DOM.resetMoveButton);

  // Create a button to shuffle letters in the letterbar
  DOM.shuffleButton = document.createElement("button");
  DOM.shuffleButton.innerText = translate("shuffle");

  const shuffleHandler = () => {
    bar.shuffleLetters();
  };

  DOM.shuffleButton.onclick = shuffleHandler;
  DOM.shuffleButton.ontouchend = (e) => {
    e.preventDefault();
    shuffleHandler();
  };

  document.getElementById("actions").appendChild(DOM.shuffleButton);

  // Create a button to switch out some letters in the letterbar
  DOM.switchButton = document.createElement("button");
  DOM.switchButton.innerText = translate("switch_letters");

  const switchHandler = () => {
    if (!window.gameContext.switchLetters) {
      window.gameContext.switchLetters = true;
    } else {
      if (bar.hasMarkedLetters()) {
        bar.switchMarkedLetters();
      }
      window.gameContext.switchLetters = false;
    }
  };

  DOM.switchButton.onclick = switchHandler;
  DOM.switchButton.ontouchend = (e) => {
    e.preventDefault();
    switchHandler();
  };

  document.getElementById("actions").appendChild(DOM.switchButton);

  // Score label
  DOM.scoreLabel = document.createElement("span");
  DOM.scoreLabel.id = "score-label";
  DOM.scoreLabel.innerText = translateFormatted("score_label", 0);
  document.getElementById("game-stats").appendChild(DOM.scoreLabel);

  // Last played word label (optional)

  DOM.lastWordLabel = document.createElement("span");
  DOM.lastWordLabel.id = "last-word-label";
  DOM.lastWordLabel.innerText = translateFormatted("last_word", "-");
  document.getElementById("game-stats").appendChild(DOM.lastWordLabel);
};

window.setup = function () {
  calculateDynamicSizes(); // Calculate responsive cell size

  grid = new Grid(15, 15, cellSize);
  bar = new Letterbar(0, grid.getHeight() + margin, grid.getWidth(), cellSize);

  createCanvas(
    grid.getWidth(),
    grid.getHeight() + bar.getHeight() + margin
  ).parent("canvas-wrapper");

  // Must be after createCanvas to ensure width/height are defined
  wildcardSelector = new WildcardSelector();

  bar.init();
  setupActionButtons();

  textAlign(CENTER, CENTER);
};

window.draw = function () {
  if (!initialized) {
    if (window.servicesReady) {
      initialized = true;
      console.log(
        "[main] Core Services are ready. Starting draw loop. Game on =)"
      );
    } else {
      console.log("[main] Waiting for services to be ready...");
      return; // Wait until services are ready
    }
  }

  background(styleUtils.sketch.backgroundColor);
  grid.render();
  bar.render();

  if (window.gameContext.draggedLetter) {
    renderUtils.renderDraggedTile(window.gameContext.draggedLetter, cellSize);
  }

  if (window.gameContext.switchLetters) {
    grid.renderOverlay();
  }

  handleCursorStyle();
  renderWildcardSelector();
  handleDom();
};

const handleCursorStyle = () => {
  const mouseOverBarLetter = bar.getLetterAtPosition(mouseX, mouseY) !== null;
  const gridLetter = grid.getMouseOverLetter();
  const mouseOverLiveGridLetter = gridLetter && gridLetter.isLive;

  if (mouseOverBarLetter || mouseOverLiveGridLetter) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
};

const renderWildcardSelector = () => {
  if (!window.gameContext.wildcard?.selecting) {
    return;
  }
  wildcardSelector.render();
};

const setIfValueChanged = (obj, key, newValue) => {
  if (obj[key] !== newValue) {
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

  if (
    window.gameContext.switchLetters &&
    DOM.switchButton.innerText !== translate("confirm_switch")
  ) {
    DOM.switchButton.innerText = translate("confirm_switch");
  } else if (
    !window.gameContext.switchLetters &&
    DOM.switchButton.innerText !== translate("switch_letters")
  ) {
    DOM.switchButton.innerText = translate("switch_letters");
  }
};

// Handle window resize
window.windowResized = function () {
  calculateDynamicSizes();
  grid.cellSize = cellSize;
  bar.cellSize = cellSize;
  bar.y = grid.getHeight() + margin;
  bar.width = grid.getWidth();

  resizeCanvas(grid.getWidth(), grid.getHeight() + bar.getHeight() + margin);
};

window.mousePressed = function () {
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
    window.gameContext.wildcard.letter.letter = letter;
    window.boardService.updateLetterAt(
      window.gameContext.wildcard.letter.row,
      window.gameContext.wildcard.letter.col,
      window.gameContext.wildcard.letter
    );
    window.gameContext.wildcard = null;
  }
};

const handleSwitchLetters = () => {
  const letterToToggle = bar.getLetterAtPosition(mouseX, mouseY);
  if (letterToToggle) {
    const index = bar.letters.indexOf(letterToToggle);
    if (index >= 0) {
      bar.toggleMarkLetterAtIndex(index);
    }
  }
};

const handleBeginDragFromBar = () => {
  const barLetter = bar.getLetterAtPosition(mouseX, mouseY);
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

window.mouseReleased = function () {
  if (window.gameContext.draggedLetter) {
    if (window.gameContext.dragSource === "bar") {
      handleEndDragFromBar();
    } else if (window.gameContext.dragSource === "grid") {
      handleEndDragFromGrid();
    }

    window.gameContext.draggedLetter = null;
    window.gameContext.dragSource = null;
  }
};

const handleEndDragFromBar = () => {
  const letter = window.gameContext.draggedLetter;
  if (grid.canDropLetter() && grid.dropLetter(letter)) {
    bar.removeLetter(letter);
  }
};

const handleEndDragFromGrid = () => {
  const letter = window.gameContext.draggedLetter;
  if (bar.mouseIsOver()) {
    bar.addLetter(letter);
    grid.removeLetter(letter);
  } else if (grid.canDropLetter()) {
    grid.removeLetter(letter);
    grid.dropLetter(letter);
  }
};

window.touchStarted = function () {
  window.mousePressed();
  return false;
};

window.touchEnded = function () {
  window.mouseReleased();
  return false;
};

window.touchMoved = function () {
  if (window.gameContext.draggedLetter) {
    return false;
  }
};
