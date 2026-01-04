export interface PlacedLetter {
  id: number;
  letter: string;
  row: number;
  col: number;
  value: number;
  isLive: boolean;
  wildCard?: boolean;
}
