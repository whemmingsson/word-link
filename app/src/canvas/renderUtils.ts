import { p } from "../utils/p5Utils";
//@ts-ignore: Ignore missing p5 module error for now
import { styleUtils } from "./styleUtils";

export class RenderUtils {}

const renderText = (
  textContent: string,
  x: number,
  y: number,
  textColor = styleUtils.tile.textColor,
  textSizeValue = 28
) => {
  p().fill(textColor);
  p().noStroke();
  p().textSize(textSizeValue);
  p().text(textContent, x, y);
};

const renderSquare = (
  x: number,
  y: number,
  width: number,
  fillColor: string
) => {
  p().fill(fillColor);
  p().rect(x, y, width, width);
};

const renderLetterTile = (
  letterObj: { letter: string; value?: number },
  x: number,
  y: number,
  cellSize: number,
  fillColor: string,
  borderColor: string | null = null
) => {
  const tileX = x - cellSize / 2;
  const tileY = y - cellSize / 2;
  const borderWidth = 2;
  const borderRadius = 5;

  // Draw main tile
  if (borderColor) {
    p().stroke(borderColor);
  }
  p().strokeWeight(borderWidth);
  p().fill(fillColor);
  p().rect(
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

const shouldRenderShadedCell = (
  row: number,
  col: number,
  rows: number,
  cols: number,
  cellIsOccupiedFunc: (row: number, col: number) => boolean
) => {
  return (
    col >= 0 &&
    col < cols &&
    row >= 0 &&
    row < rows &&
    window.gameContext.draggedLetter &&
    !cellIsOccupiedFunc(row, col)
  );
};

const renderShadedCell = (row: number, col: number, cellSize: number) => {
  renderSquare(
    col * cellSize,
    row * cellSize,
    cellSize,
    styleUtils.grid.cell.shaded.fillColor
  );
};

const renderShadedCellIfTileIsDragged = (
  rows: number,
  cols: number,
  cellSize: number,
  cellIsOccupiedFunc: (row: number, col: number) => boolean,
  transformedMouseX: number | null = null,
  transformedMouseY: number | null = null
) => {
  // Use transformed coordinates if provided (for zoom support), otherwise use raw mouseX/mouseY
  const mX = transformedMouseX !== null ? transformedMouseX : p().mouseX;
  const mY = transformedMouseY !== null ? transformedMouseY : p().mouseY;
  const col = Math.floor(mX / cellSize);
  const row = Math.floor(mY / cellSize);
  if (shouldRenderShadedCell(row, col, rows, cols, cellIsOccupiedFunc)) {
    renderShadedCell(row, col, cellSize);
  }
};

const renderTileWithLetter = (
  letter: {
    col: number;
    row: number;
    isLive: boolean;
    letter: string;
    value?: number;
  },
  cellSize: number
) => {
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

const renderDraggedTile = (
  letter: {
    col: number;
    row: number;
    isLive: boolean;
    letter: string;
    value?: number;
  },
  cellSize: number
) => {
  renderLetterTile(
    letter,
    p().mouseX,
    p().mouseY,
    cellSize,
    styleUtils.tile.fillColorLive,
    styleUtils.tile.borderColorLive
  );
};

const renderLetterTileAtPosition = (
  letter: {
    col: number;
    row: number;
    isLive: boolean;
    letter: string;
    value?: number;
  },
  x: number,
  y: number,
  cellSize: number
) => {
  renderLetterTile(
    letter,
    x,
    y,
    cellSize,
    styleUtils.tile.fillColorLive,
    styleUtils.tile.borderColorLive
  );
};

const renderBoardTileAtPosition = (
  x: number,
  y: number,
  tile: number,
  cellSize: number
) => {
  const tileConfig =
    styleUtils.grid.specialTiles[tile] || styleUtils.grid.specialTiles[0];

  if (tile === 0) {
    p().stroke(0);
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

const renderLetterHighlightAtPosition = (
  x: number,
  y: number,
  cellSize: number
) => {
  const strokeWeightValue = 4;
  const borderRadius = 5;
  p().noFill();
  p().stroke(styleUtils.letterBar.markedLetterBorderColor);
  p().strokeWeight(strokeWeightValue);
  p().rect(
    x - cellSize / 2 + strokeWeightValue / 2,
    y - cellSize / 2 + strokeWeightValue / 2,
    cellSize - strokeWeightValue,
    cellSize - strokeWeightValue,
    borderRadius
  );
  styleUtils.resetStyles();
};

const renderGridOverlay = (rows: number, cols: number, cellSize: number) => {
  p().fill(0, 0, 0, 180);
  p().rect(0, 0, cols * cellSize, rows * cellSize);
};

const renderCenterStar = (x: number, y: number, cellSize: number) => {
  const starSize = cellSize / 3;
  p().fill(styleUtils.grid.centerShapeFillColor);
  p().noStroke();
  p().beginShape();
  for (let i = 0; i < 5; i++) {
    const angle = i * (p().TWO_PI / 5) - p().HALF_PI;
    const sx = x + p().cos(angle) * starSize;
    const sy = y + p().sin(angle) * starSize;
    p().vertex(sx, sy);
    const innerAngle = angle + p().PI / 5;
    const innerX = x + p().cos(innerAngle) * (starSize / 2);
    const innerY = y + p().sin(innerAngle) * (starSize / 2);
    p().vertex(innerX, innerY);
  }
  p().endShape(p().CLOSE);
};

export const renderUtils = {
  renderShadedCellIfTileIsDragged,
  renderTileWithLetter,
  renderDraggedTile,
  renderLetterTileAtPosition,
  renderBoardTileAtPosition,
  renderLetterHighlightAtPosition,
  renderGridOverlay,
  renderCenterStar,
};
