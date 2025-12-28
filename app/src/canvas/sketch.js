import { Grid } from "./grid.js";
import { Letterbar } from "./letterbar.js";
import { renderUtils } from "./renderUtils.js";
import { styleUtils } from "./styleUtils.js";

let grid;
let bar;
const margin = 20;
const cellSize = 50;
let initialized = false;

window.gameContext = {};
window.gameContext.draggedLetter = false;
window.gameContext.cellSize = cellSize;

const setupActionButtons = () => {
  // Create a button to finish the move
  const finishMoveButton = document.createElement("button");
  finishMoveButton.innerText = "Finish Move";
  finishMoveButton.onclick = () => {
    if (!grid.isValidPlacement()) {
      alert("Invalid letter placement. Please adjust the letters on the grid.");
      return;
    }
    grid.finalizeMove();
    // Add new letters to the letterbar to replenish it
    const newLetters = window.letterPoolService.drawLetters(
      7 - bar.letters.length
    );
    bar.letters.push(...newLetters);
  };

  document.getElementById("actions").appendChild(finishMoveButton);

  // Create a button to reset the placed live letters
  const resetMoveButton = document.createElement("button");
  resetMoveButton.innerText = "Reset Move";
  resetMoveButton.onclick = () => {
    // Move all live letters back to the letterbar
    grid.liveLetters.forEach((letter) => {
      bar.addLetter(letter);
    });
    grid.resetMove();
  };

  document.getElementById("actions").appendChild(resetMoveButton);
};

const handleCursorStyle = () => {
  // Centralized cursor logic
  const mouseOverBarLetter = bar.getLetterAtPosition(mouseX, mouseY) !== null;
  const gridLetter = grid.getMouseOverLetter();
  const mouseOverLiveGridLetter = gridLetter && gridLetter.isLive;

  if (mouseOverBarLetter || mouseOverLiveGridLetter) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
};

window.setup = function () {
  grid = new Grid(15, 15, cellSize);
  bar = new Letterbar(0, grid.getHeight() + margin, grid.getWidth(), cellSize);

  createCanvas(
    grid.getWidth(),
    grid.getHeight() + bar.getHeight() + margin
  ).parent("canvas-wrapper");

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
};

window.mousePressed = function () {
  if (window.gameContext.wildcard?.selecting) {
    // Check which letter was clicked
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");
    const cols = 7;
    const cellSize = 40;
    const boxW = 400;
    const boxH = 350;
    const boxX = width / 2 - boxW / 2;
    const boxY = height / 2 - boxH / 2;
    const startX = boxX + 40;
    const startY = boxY + 80;

    for (let i = 0; i < letters.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cellSize + 5);
      const y = startY + row * (cellSize + 5);

      // Check if mouse is within this letter's bounds
      if (
        mouseX > x &&
        mouseX < x + cellSize &&
        mouseY > y &&
        mouseY < y + cellSize
      ) {
        // Update the wildcard letter
        window.gameContext.wildcard.letter.letter = letters[i];
        window.boardService.updateLetterAt(
          window.gameContext.wildcard.letter.row,
          window.gameContext.wildcard.letter.col,
          window.gameContext.wildcard.letter
        );
        window.gameContext.wildcard = null;
        return;
      }
    }
    // If clicked outside the letter grid but inside the modal, do nothing
    return;
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
    console.log("Grid letter under mouse:", gridLetter);
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

// Add to sketch.js or new wildcardSelector.js
const renderWildcardSelector = () => {
  if (!window.gameContext.wildcard?.selecting) return;

  // Semi-transparent overlay
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  // White dialog box
  const boxW = 400;
  const boxH = 350;
  const boxX = width / 2 - boxW / 2;
  const boxY = height / 2 - boxH / 2;

  fill(255);
  rect(boxX, boxY, boxW, boxH, 10);

  // Title
  fill(0);
  textSize(20);
  textAlign(CENTER);
  text("Select a letter for wildcard:", width / 2, boxY + 40);

  // Draw letter grid (A-Z)
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");
  const cols = 7;
  const cellSize = 40;
  const startX = boxX + 40;
  const startY = boxY + 80;

  for (let i = 0; i < letters.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cellSize + 5);
    const y = startY + row * (cellSize + 5);

    // Highlight on hover
    if (
      mouseX > x &&
      mouseX < x + cellSize &&
      mouseY > y &&
      mouseY < y + cellSize
    ) {
      fill(200, 220, 255);
      cursor(HAND);
    } else {
      fill(240);
    }

    rect(x, y, cellSize, cellSize, 5);
    fill(0);
    textSize(24);
    text(letters[i], x + cellSize / 2, y + cellSize / 2);
  }
};
