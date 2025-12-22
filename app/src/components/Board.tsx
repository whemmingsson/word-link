import { useMemo } from "react";
import { makeTileMap } from "../config/tileConfig";
import styles from "./Board.module.css";
import { Tile } from "../types/tile";
import { useDroppable } from "@dnd-kit/core";
import type { LetterTile } from "../../../common/types/LetterTile";

interface PlacedLetter {
  letter: LetterTile;
  x: number;
  y: number;
}

interface BoardProps {
  placedLetters: PlacedLetter[];
}

const BoardCell = ({
  x,
  y,
  cellClassName,
  specialTileText,
  placedLetter,
}: {
  x: number;
  y: number;
  cellClassName: string;
  specialTileText: string;
  placedLetter?: LetterTile;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${x},${y}`,
  });

  const style = isOver
    ? {
        backgroundColor: "rgba(0, 255, 0, 0.2)",
      }
    : undefined;

  return (
    <div ref={setNodeRef} className={cellClassName} style={style}>
      {placedLetter ? (
        <span style={{ fontWeight: "bold", fontSize: "1.2em" }}>
          {placedLetter.letter || "🃏"}
        </span>
      ) : (
        specialTileText
      )}
    </div>
  );
};

const getTileClassName = (tileType: Tile) => {
  switch (tileType) {
    case Tile.Empty:
      return styles["empty-cell"];
    case Tile.DoubleLetter:
      return styles["dl-cell"];
    case Tile.TripleLetter:
      return styles["tl-cell"];
    case Tile.DoubleWord:
      return styles["dw-cell"];
    case Tile.TripleWord:
      return styles["tw-cell"];
    default:
      return styles.empty;
  }
};

const getSpecialTileText = (tileType: Tile) => {
  switch (tileType) {
    case Tile.DoubleLetter:
      return "DL";
    case Tile.TripleLetter:
      return "TL";
    case Tile.DoubleWord:
      return "DW";
    case Tile.TripleWord:
      return "TW";
    default:
      return "";
  }
};

export const Board = ({ placedLetters }: BoardProps) => {
  const width = 15;
  const height = 15;

  const tileMap = useMemo(() => makeTileMap(), []);

  const getPlacedLetter = (x: number, y: number) => {
    return placedLetters.find((pl) => pl.x === x && pl.y === y)?.letter;
  };

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
      }}
    >
      {Array.from({ length: width * height }).map((_, index) => {
        const x = index % width;
        const y = Math.floor(index / width);
        const key = `${x},${y}`;
        const tileType = tileMap[key] ?? Tile.Empty;
        const isSpecialTile = tileMap[key] !== undefined;
        const cellClassName = isSpecialTile
          ? `${styles.cell} ${getTileClassName(tileType)}`
          : styles.cell;
        const placedLetter = getPlacedLetter(x, y);

        return (
          <BoardCell
            key={index}
            x={x}
            y={y}
            cellClassName={cellClassName}
            specialTileText={isSpecialTile ? getSpecialTileText(tileType) : ""}
            placedLetter={placedLetter}
          />
        );
      })}
    </div>
  );
};
