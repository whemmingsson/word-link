import { styleUtils } from "./styleUtils";

const renderText = (textContent, x, y) => {
  fill(styleUtils.tile.textColor);
  noStroke();
  textSize(24);
  text(textContent, x, y);
};

const renderSquare = (x, y, width, fillColor) => {
  fill(fillColor);
  rect(x, y, width, width);
};

const renderLetterTile = (letter, x, y, cellSize, fillColor, borderColor) => {
  const tileX = x - cellSize / 2;
  const tileY = y - cellSize / 2;
  const shadowOffset = 3;
  const borderWidth = 2;
  const borderRadius = 5;

  // Draw shadow
  noStroke();
  fill("#66666662");
  rect(
    tileX + shadowOffset,
    tileY + shadowOffset,
    cellSize,
    cellSize,
    borderRadius
  );

  // Draw main tile

  fill(fillColor);
  if (borderColor) {
    stroke(borderColor);
    strokeWeight(borderWidth);
  }
  rect(
    tileX + borderWidth,
    tileY + borderWidth,
    cellSize - borderWidth * 2,
    cellSize - borderWidth * 2,
    borderRadius
  );

  // Draw text
  renderText(letter, x, y);
};

const renderGridLines = (rows, cols, cellSize) => {
  stroke(styleUtils.grid.lineColor);
  strokeWeight(1);

  // Draw horizontal lines
  for (let row = 0; row <= rows; row++) {
    line(0, row * cellSize, cols * cellSize, row * cellSize);
  }

  // Draw vertical lines
  for (let col = 0; col <= cols; col++) {
    line(col * cellSize, 0, col * cellSize, rows * cellSize);
  }
};

const shouldRenderShadedCell = (row, col, rows, cols, cellIsOccupiedFunc) => {
  return (
    col >= 0 &&
    col < cols &&
    row >= 0 &&
    row < rows &&
    window.gameContext.draggedLetter &&
    !cellIsOccupiedFunc(row, col)
  );
};

const renderShadedCell = (row, col, cellSize) => {
  renderSquare(
    col * cellSize,
    row * cellSize,
    cellSize,
    styleUtils.grid.cell.shaded.fillColor
  );
};

const renderShadedCellIfTileIsDragged = (
  rows,
  cols,
  cellSize,
  cellIsOccupiedFunc
) => {
  const mX = mouseX;
  const mY = mouseY;
  const col = Math.floor(mX / cellSize);
  const row = Math.floor(mY / cellSize);
  if (shouldRenderShadedCell(row, col, rows, cols, cellIsOccupiedFunc)) {
    renderShadedCell(row, col, cellSize);
  }
};

const renderTileWithLetter = (letter, cellSize) => {
  const x = letter.col * cellSize + cellSize / 2;
  const y = letter.row * cellSize + cellSize / 2;

  renderLetterTile(
    letter.letter,
    x,
    y,
    cellSize,
    letter.isLive
      ? styleUtils.tile.fillColorLive
      : styleUtils.tile.fillColorPlaced,
    letter.isLive
      ? styleUtils.tile.borderColorLive
      : styleUtils.tile.borderColorPlaced
  );
};

const renderDraggedTile = (letter, cellSize) => {
  renderLetterTile(
    letter,
    mouseX,
    mouseY,
    cellSize,
    styleUtils.tile.fillColorLive,
    styleUtils.tile.borderColorLive
  );
};

const renderLetterTileAtPosition = (letter, x, y, cellSize) => {
  renderLetterTile(
    letter.letter,
    x,
    y,
    cellSize,
    styleUtils.tile.fillColorLive,
    styleUtils.tile.borderColorLive
  );
};

export const renderUtils = {
  renderGridLines,
  renderShadedCellIfTileIsDragged,
  renderTileWithLetter,
  renderDraggedTile,
  renderLetterTileAtPosition,
};
