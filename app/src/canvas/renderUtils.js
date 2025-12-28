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
    strokeWeight(borderWidth);
  }
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
  renderText(letter, x, y);

  // Draw value in top right corner
  if (letterObj.value) {
    const valueX = tileX + cellSize - borderWidth - 8;
    const valueY = tileY + borderWidth + 12;
    renderText(
      letterObj.value.toString(),
      valueX,
      valueY,
      styleUtils.tile.textColor,
      14
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

const renderShadow = (x, y, cellSize) => {
  // Draw shadow
  const shadowOffset = 3;
  const borderRadius = 5;
  noStroke();
  fill("#ffffff62");
  rect(
    x - cellSize / 2 + shadowOffset,
    y - cellSize / 2 + shadowOffset,
    cellSize,
    cellSize,
    borderRadius
  );
};

const renderDraggedTile = (letter, cellSize) => {
  //renderShadow(mouseX, mouseY, cellSize);
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
  let tileColor = "";
  let tileText = "";

  switch (tile) {
    case 0: // Empty
      stroke(0);
      renderSquare(
        x - cellSize / 2,
        y - cellSize / 2,
        cellSize,
        styleUtils.grid.fillColor
      );
      return;

    case 1: // DoubleLetter
      tileColor = "#3a4a58"; // Dark blue-gray
      tileText = "DL";
      break;
    case 2: // TripleLetter
      tileColor = "#2a3844"; // Darker gray-blue
      tileText = "TL";
      break;
    case 3: // DoubleWord
      tileColor = "#4a4238"; // Dark warm gray
      tileText = "DW";
      break;
    case 4: // TripleWord
      tileColor = "#3a2e24"; // Darker warm brown-gray
      tileText = "TW";
      break;
    default:
      tileColor = "#999999"; // Fallback gray
      tileText = "";
  }

  renderSquare(x - cellSize / 2, y - cellSize / 2, cellSize, tileColor);
  renderText(tileText, x, y, styleUtils.grid.cell.textColor, 18);
};

export const renderUtils = {
  renderGridLines,
  renderShadedCellIfTileIsDragged,
  renderTileWithLetter,
  renderDraggedTile,
  renderLetterTileAtPosition,
  renderBoardTileAtPosition,
};
