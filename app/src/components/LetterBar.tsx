import { useEffect, useState } from "react";
import type { LetterTile } from "../../../common/types/LetterTile";
import { letterPoolService } from "../service/LetterPoolService";
import { Letter } from "./Letter";
import styles from "./LetterBar.module.css";

export const LetterBar = () => {
  const [letters, setLetters] = useState<LetterTile[]>([]);

  useEffect(() => {
    // Logic to fetch or draw letters can be added here
    setLetters(letterPoolService.drawLetters(7));
    // TODO: Ping opponent to remove letters from their pool as well
  }, []);
  return (
    <div className={styles.letterBar}>
      {letters.map((letterTile, index) => (
        <Letter key={index} letter={letterTile} />
      ))}
    </div>
  );
};
