import { words } from "../../../data/words_filtered";
import { buildTree, hasWord } from "../../../common/utils/treeUtils";
import type { Node } from "../../../common/types/Node";

export class DictionaryService {
  dictionary: Node;
  cache: Map<string, boolean>;

  constructor() {
    this.dictionary = buildTree(words);
    this.cache = new Map<string, boolean>();
    console.log("DictionaryService initialized with dictionary tree.");
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

// Singleton instance - created once on app load
export const dictionaryService = new DictionaryService();
