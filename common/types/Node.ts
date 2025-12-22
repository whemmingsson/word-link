export interface Node {
  subWord: string;
  children: Map<string, Node>;
  isEndOfWord?: boolean; // Flag to mark valid word endings
}
