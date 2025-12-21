import { words } from "../../data/words_filtered";
import { Node } from "../types/LetterNode";
import { buildTree, hasWord } from "../utils/treeUtils";

export class DictionaryService {
  dictionary: Node;
  cache: Map<string, boolean>;

  constructor() {
    this.dictionary = buildTree(words);
    this.cache = new Map<string, boolean>();
  }

  hasWord(word: string): boolean {
    const upperWord = word.toUpperCase();
    if (this.cache.has(upperWord)) {
      return this.cache.get(upperWord)!;
    }
    const result = hasWord(this.dictionary, upperWord);
    this.cache.set(upperWord, result);
    return result;
  }
}
