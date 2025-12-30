import { styleUtils } from "./styleUtils";

const renderText = (
  textContent,
  x,
  y,
  textColor = styleUtils.tile.textColor,
  textSizeValue = 28
) => {
  fill(textColor);
  noStroke();
  textSize(textSizeValue);
  text(textContent, x, y);
};

const renderSquare = (x, y, width, fillColor) => {
  fill(fillColor);
  rect(x, y, width, width);
};

const renderLetterTile = (
  letterObj,
  x,
  y,
  cellSize,
  fillColor,
  borderColor
) => {
  const tileX = x - cellSize / 2;
  const tileY = y - cellSize / 2;
  const borderWidth = 2;
  const borderRadius = 5;

  // Draw main tile
  if (borderColor) {
    stroke(borderColor);
  }
  strokeWeight(borderWidth);
  fill(fillColor);
  rect(
    tileX + borderWidth,
    tileY + borderWidth,
    cellSize - borderWidth * 2,
    cellSize - borderWidth * 2,
    borderRadius
  );

  // Draw letter
  const letter = letterObj.letter;
  renderText(letter, x, y, window.gameContext.letterTileTextSize);

  // Draw value in top right corner
  if (letterObj.value) {
    const scoreTextSize = window.gameContext.letterTileScoreTextSize;
    const valueX = tileX + cellSize - borderWidth - scoreTextSize;
    const valueY = tileY + borderWidth + scoreTextSize;
    renderText(
      letterObj.value.toString(),
      valueX,
      valueY,
      styleUtils.tile.textColor,
      scoreTextSize
    );
  }
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
    letter,
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
    letter,
    x,
    y,
    cellSize,
    styleUtils.tile.fillColorLive,
    styleUtils.tile.borderColorLive
  );
};

const renderBoardTileAtPosition = (x, y, tile, cellSize) => {
  const tileConfig =
    styleUtils.grid.specialTiles[tile] || styleUtils.grid.specialTiles[0];

  if (tile === 0) {
    stroke(0);
    renderSquare(
      x - cellSize / 2,
      y - cellSize / 2,
      cellSize,
      styleUtils.grid.fillColor
    );
    return;
  }

  renderSquare(x - cellSize / 2, y - cellSize / 2, cellSize, tileConfig.color);
  renderText(
    tileConfig.text,
    x,
    y,
    styleUtils.grid.cell.textColor,
    window.gameContext.gridTextSize
  );
};

const renderLetterHighlightAtPosition = (x, y, cellSize) => {
  const strokeWeightValue = 4;
  const borderRadius = 5;
  noFill();
  stroke(styleUtils.letterBar.markedLetterBorderColor);
  strokeWeight(strokeWeightValue);
  rect(
    x - cellSize / 2 + strokeWeightValue / 2,
    y - cellSize / 2 + strokeWeightValue / 2,
    cellSize - strokeWeightValue,
    cellSize - strokeWeightValue,
    borderRadius
  );
  styleUtils.resetStyles();
};

const renderGridOverlay = (rows, cols, cellSize) => {
  fill(0, 0, 0, 180);
  rect(0, 0, cols * cellSize, rows * cellSize);
};

export const renderUtils = {
  renderGridLines,
  renderShadedCellIfTileIsDragged,
  renderTileWithLetter,
  renderDraggedTile,
  renderLetterTileAtPosition,
  renderBoardTileAtPosition,
  renderLetterHighlightAtPosition,
  renderGridOverlay,
};
