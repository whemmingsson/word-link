import type { LetterTile } from "../../../common/types/LetterTile";
import styles from "./Letter.module.css";

export const Letter = ({ letter }: { letter: LetterTile }) => {
  return <div className={styles.letter}>{letter.letter}</div>;
};
