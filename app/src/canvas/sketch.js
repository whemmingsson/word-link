import { Grid } from "./grid.js";
import { Letterbar } from "./letterbar.js";

let grid;
let bar;
const padding = 20;
const cellSize = 50;
let initialized = false;

window.gameContext = {};
window.gameContext.letterBeeingDragged = false;
window.gameContext.cellSize = cellSize;

window.setup = function () {
  grid = new Grid(15, 15, cellSize);
  bar = new Letterbar(0, grid.getHeight() + padding, grid.getWidth(), cellSize);

  createCanvas(
    grid.getWidth(),
    grid.getHeight() + bar.getHeight() + padding
  ).parent("canvas-wrapper");

  bar.init();
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

  background(255);
  grid.drawGrid();
  bar.drawLetterbar();

  if (window.gameContext.letterBeeingDragged) {
    fill("#ffe881ff");
    rect(mouseX - cellSize / 2, mouseY - cellSize / 2, cellSize, cellSize);
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(window.gameContext.letterBeeingDragged.letter, mouseX, mouseY);
  }
};

window.mousePressed = function () {
  // Check if dragging from letterbar - use direct position detection for better touch support
  if (!window.gameContext.letterBeeingDragged) {
    const barLetter = bar.getLetterAtPosition(mouseX, mouseY);
    if (barLetter) {
      window.gameContext.letterBeeingDragged = barLetter;
      window.gameContext.dragSource = "bar";
      return;
    }
  }

  // Check if dragging from grid (only liveLetters)
  if (grid.mouseIsOver() && !window.gameContext.letterBeeingDragged) {
    const gridLetter = grid.getMouseOverLetter();
    if (gridLetter) {
      window.gameContext.letterBeeingDragged = { letter: gridLetter.letter };
      window.gameContext.dragSource = "grid";
      window.gameContext.draggedGridLetter = gridLetter;
    }
  }
};

window.mouseReleased = function () {
  if (window.gameContext.letterBeeingDragged) {
    let letterHandled = false;

    // Dragging from bar to grid
    if (window.gameContext.dragSource === "bar") {
      if (
        grid.canDropLetter() &&
        grid.dropLetter(window.gameContext.letterBeeingDragged.letter)
      ) {
        bar.removeLetter(window.gameContext.letterBeeingDragged);
        letterHandled = true;
      }
      // If letter wasn't successfully dropped, it stays in the bar (no action needed)
    }
    // Dragging from grid to bar
    else if (window.gameContext.dragSource === "grid") {
      if (bar.mouseIsOver()) {
        // Drop letter back to bar
        bar.addLetter(window.gameContext.letterBeeingDragged);
        grid.removeLetter(window.gameContext.draggedGridLetter);
        letterHandled = true;
      }
      // Drop back to grid (same or different cell)
      else if (grid.canDropLetter()) {
        grid.removeLetter(window.gameContext.draggedGridLetter);
        grid.dropLetter(window.gameContext.letterBeeingDragged.letter);
        letterHandled = true;
      }
      // If not dropped anywhere valid, letter stays in original grid position
    }

    window.gameContext.letterBeeingDragged = null;
    window.gameContext.dragSource = null;
    window.gameContext.draggedGridLetter = null;
  }
};

window.mouseDragged = function () {
  // Future implementation for dragging letters
  if (window.gameContext.letterBeeingDragged) {
    return; // Already dragging a letter
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
  if (window.gameContext.letterBeeingDragged) {
    return false;
  }
};
