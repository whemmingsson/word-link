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
const cellSize = 50;
let initialized = false;

window.gameContext = {};
window.gameContext.draggedLetter = false;
window.gameContext.cellSize = cellSize;

const DOM = {
  finishMoveButton: null,
  resetMoveButton: null,
  shuffleButton: null,
  switchButton: null,
  scoreLabel: null,
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
      console.log("Services are ready. Starting draw loop.");
    } else {
      return; // Wait until services are ready
    }
  }

  background(styleUtils.sketch.backgroundColor);
  grid.drawGrid();
  bar.drawLetterbar();

  if (window.gameContext.draggedLetter) {
    renderUtils.renderDraggedTile(window.gameContext.draggedLetter, cellSize);
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

const handleDom = () => {
  const hasPlacedLetters = grid.hasPlacedAnyLetters();
  DOM.finishMoveButton.disabled = !hasPlacedLetters;
  DOM.resetMoveButton.disabled = !hasPlacedLetters;
  DOM.shuffleButton.disabled = window.gameContext.switchLetters === true;
  DOM.switchButton.disabled = hasPlacedLetters;

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

window.mousePressed = function () {
  if (window.gameContext.wildcard?.selecting) {
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
  }

  if (window.gameContext.switchLetters) {
    const letterToToggle = bar.getLetterAtPosition(mouseX, mouseY);
    if (letterToToggle) {
      const index = bar.letters.indexOf(letterToToggle);
      if (index >= 0) {
        bar.toggleMarkLetterAtIndex(index);
      }
    }
    return; // Skip dragging logic while switching letters
  }

  // Check if dragging from letterbar - use direct position detection for better touch support
  if (!window.gameContext.draggedLetter) {
    const barLetter = bar.getLetterAtPosition(mouseX, mouseY);
    if (barLetter) {
      window.gameContext.draggedLetter = barLetter;
      window.gameContext.dragSource = "bar";
      return;
    }
  }

  // Check if dragging from grid (only liveLetters)
  if (grid.mouseIsOver() && !window.gameContext.draggedLetter) {
    const gridLetter = grid.getMouseOverLetter();
    if (gridLetter) {
      window.gameContext.draggedLetter = gridLetter;
      window.gameContext.dragSource = "grid";
    }
  }
};

window.mouseReleased = function () {
  if (window.gameContext.draggedLetter) {
    // Dragging from bar to grid
    if (window.gameContext.dragSource === "bar") {
      if (
        grid.canDropLetter() &&
        grid.dropLetter(window.gameContext.draggedLetter)
      ) {
        bar.removeLetter(window.gameContext.draggedLetter);
      }
      // If letter wasn't successfully dropped, it stays in the bar (no action needed)
    }

    // Dragging from grid to bar
    else if (window.gameContext.dragSource === "grid") {
      if (bar.mouseIsOver()) {
        // Drop letter back to bar
        bar.addLetter(window.gameContext.draggedLetter);
        grid.removeLetter(window.gameContext.draggedLetter);
      }
      // Drop back to grid (same or different cell)
      else if (grid.canDropLetter()) {
        grid.removeLetter(window.gameContext.draggedLetter);
        grid.dropLetter(window.gameContext.draggedLetter);
      }
      // If not dropped anywhere valid, letter stays in original grid position
    }

    window.gameContext.draggedLetter = null;
    window.gameContext.dragSource = null;
  }
};

// Touch event handlers for mobile/tablet support
window.touchStarted = function () {
  // Call the same logic as mousePressed
  window.mousePressed();
  // Prevent default touch behavior (scrolling)
  return false;
};

window.touchEnded = function () {
  // Call the same logic as mouseReleased
  window.mouseReleased();
  // Prevent default touch behavior
  return false;
};

window.touchMoved = function () {
  // Prevent scrolling while dragging
  if (window.gameContext.draggedLetter) {
    return false;
  }
};
