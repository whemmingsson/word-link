import { words } from "../data/words_filtered";
import { buildTree, hasWord } from "../utils/treeUtils";
import type { Node } from "../types/Node";

export class DictionaryService {
  dictionary: Node;
  cache: Map<string, boolean>;

  constructor() {
    this.dictionary = buildTree(words);
    this.cache = new Map<string, boolean>();
    console.log(
      "[core service] DictionaryService initialized with dictionary tree."
    );
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

  validateWords(words: string[]): {
    valid: string[];
    invalid: string[];
    allValid: boolean;
  } {
    let allValid = true;
    const valid: string[] = [];
    const invalid: string[] = [];
    for (const word of words) {
      if (this.hasWord(word)) {
        valid.push(word);
      } else {
        invalid.push(word);
        allValid = false;
      }
    }
    return { allValid, valid, invalid };
  }
}

// Singleton instance - created once on app load
export const dictionaryService = new DictionaryService();
