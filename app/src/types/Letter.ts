// New Type to consolidate LetterTile and PlacedLetter types
export interface Letter {
  id: number;
  letter: string;
  value: number;
  wildCard?: boolean;
  row?: number;
  col?: number;
  isLive?: boolean;
}
