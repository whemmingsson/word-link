import { useMemo } from "react";
import { makeTileMap } from "../config/tileConfig";
import styles from "./Board.module.css";
import { Tile } from "../types/tile";

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

export const Board = () => {
  const width = 15;
  const height = 15;

  const tileMap = useMemo(() => makeTileMap(), []);

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

        return (
          <div key={index} className={cellClassName}>
            {isSpecialTile ? getSpecialTileText(tileType) : ""}
          </div>
        );
      })}
    </div>
  );
};
