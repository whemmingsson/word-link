import type { LetterType } from "../types/LetterType";
import type { LetterTile } from "../types/LetterTile";

export const lettersConfig: LetterType[] = [
  { letter: "D", value: 1, count: 7 },
  { letter: "O", value: 2, count: 5 },
  { letter: "R", value: 1, count: 9 },
  { letter: "Ä", value: 4, count: 2 },
  { letter: "S", value: 1, count: 8 },
  { letter: "Å", value: 4, count: 2 },
  { letter: "E", value: 1, count: 8 },
  { letter: "T", value: 1, count: 7 },
  { letter: "*", value: 0, count: 2, wildCard: true },
  { letter: "L", value: 1, count: 7 },
  { letter: "A", value: 1, count: 9 },
  { letter: "F", value: 4, count: 2 },
  { letter: "Ö", value: 4, count: 2 },
  { letter: "I", value: 1, count: 6 },
  { letter: "N", value: 1, count: 7 },
  { letter: "Y", value: 8, count: 2 },
  { letter: "H", value: 3, count: 3 },
  { letter: "M", value: 3, count: 3 },
  { letter: "G", value: 2, count: 4 },
  { letter: "B", value: 4, count: 2 },
  { letter: "K", value: 3, count: 3 },
  { letter: "C", value: 8, count: 2 },
  { letter: "X", value: 10, count: 1 },
  { letter: "P", value: 3, count: 3 },
  { letter: "V", value: 4, count: 2 },
  { letter: "Z", value: 10, count: 1 },
  { letter: "J", value: 8, count: 1 },
  { letter: "U", value: 3, count: 3 },
  { letter: "Q", value: 10, count: 1 },
];

export const getLetterPool = (): LetterTile[] => {
  const pool: LetterTile[] = [];
  let idCounter = 0;
  lettersConfig.forEach(({ letter, value, count, wildCard }) => {
    for (let i = 0; i < count; i++) {
      pool.push({ letter, value, id: idCounter++, wildCard });
    }
  });
  return pool;
};
