import { describe, it, expect } from "vitest";
import { hasWord, countNodes, buildTree } from "../../common/utils/treeUtils";
import { readFileAsLines } from "./fileUtils";
import config from "./config/config";
import { Node } from "../../common/types/LetterNode";

// Binary search helper
const binarySearch = (sortedArray: string[], target: string): boolean => {
  const targetLower = target.toLowerCase();
  let left = 0;
  let right = sortedArray.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = sortedArray[mid]?.toLowerCase();

    if (!midValue) {
      return false;
    }

    if (midValue === targetLower) {
      return true;
    } else if (midValue < targetLower) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return false;
};

describe.skip("Performance: Tree vs Array vs Binary Search", () => {
  it("should compare different search methods", async () => {
    // Load the word list
    const words = await readFileAsLines(config.wordListPathFiltered);
    console.log(`Loaded ${words.length} words`);

    // Build the tree
    const treeStart = performance.now();
    const tree = buildTree(words);
    const treeBuildTime = performance.now() - treeStart;
    console.log(`Tree built in ${treeBuildTime.toFixed(2)}ms`);

    // Prepare test words - mix of existing and non-existing words
    const testWords = [
      ...words.slice(0, 100), // First 100 words (should exist)
      ...words.slice(
        Math.floor(words.length / 2),
        Math.floor(words.length / 2) + 100
      ), // Middle 100 words
      ...words.slice(-100), // Last 100 words
      "nonexistentword1",
      "nonexistentword2",
      "zzzzzzzzz",
    ];

    console.log(`Testing with ${testWords.length} words`);

    // Test tree search performance
    const treeSearchStart = performance.now();
    let treeFoundCount = 0;
    for (const word of testWords) {
      if (hasWord(tree, word)) {
        treeFoundCount++;
      }
    }
    const treeSearchTime = performance.now() - treeSearchStart;

    // Test array linear search performance
    const arraySearchStart = performance.now();
    let arrayFoundCount = 0;
    for (const word of testWords) {
      if (words.find((w) => w.toLowerCase() === word.toLowerCase())) {
        arrayFoundCount++;
      }
    }
    const arraySearchTime = performance.now() - arraySearchStart;

    // Test binary search performance
    const binarySearchStart = performance.now();
    let binaryFoundCount = 0;
    for (const word of testWords) {
      if (binarySearch(words, word)) {
        binaryFoundCount++;
      }
    }
    const binarySearchTime = performance.now() - binarySearchStart;

    // Results
    console.log(`\n=== Performance Results ===`);
    console.log(
      `Tree search:   ${treeSearchTime.toFixed(2)}ms (found ${treeFoundCount})`
    );
    console.log(
      `Binary search: ${binarySearchTime.toFixed(2)}ms (found ${binaryFoundCount})`
    );
    console.log(
      `Linear search: ${arraySearchTime.toFixed(2)}ms (found ${arrayFoundCount})`
    );
    console.log(`\nTree build overhead: ${treeBuildTime.toFixed(2)}ms`);
    console.log(
      `Tree is ${(binarySearchTime / treeSearchTime).toFixed(2)}x faster than binary search`
    );
    console.log(
      `Binary is ${(arraySearchTime / binarySearchTime).toFixed(2)}x faster than linear search`
    );

    // Verify all methods found the same number of words
    expect(treeFoundCount).toBe(arrayFoundCount);
    expect(binaryFoundCount).toBe(arrayFoundCount);
  });

  it("should compare memory size of tree vs array", async () => {
    // Load the word list
    const words = await readFileAsLines(config.wordListPathFiltered);
    const tree = buildTree(words);
    // Calculate array size
    const arraySize = words.reduce((total, word) => {
      // Each character is ~2 bytes (UTF-16), plus string overhead (~40 bytes per string)
      return total + word.length * 2 + 40;
    }, 0);
    const arrayOverhead = 8 * words.length; // Array pointer overhead (~8 bytes per element)
    const totalArraySize = arraySize + arrayOverhead;

    // Calculate tree size by traversing all nodes
    const calculateTreeSize = (node: Node): number => {
      let size = 0;
      // Each node has:
      // - letter string: ~2 bytes per char + 40 bytes overhead
      // - children Map: ~40 bytes base + 24 bytes per entry
      // - isWordEnd boolean: ~4 bytes
      // - Object overhead: ~40 bytes
      size += node.subWord.length * 2 + 40; // letter string
      size += 40 + node.children.size * 24; // Map overhead
      size += 40; // object overhead
      size += 4; // isEndOfWord boolean

      // Recursively add children
      for (const child of node.children.values()) {
        size += calculateTreeSize(child);
      }
      return size;
    };

    const treeSize = calculateTreeSize(tree);
    const nodeCount = countNodes(tree);

    // Results
    console.log(`\n=== Memory Size Comparison ===`);
    console.log(`Word count: ${words.length}`);
    console.log(`Tree nodes: ${nodeCount}`);
    console.log(
      `Array size: ${(totalArraySize / 1024 / 1024).toFixed(2)} MB (${totalArraySize.toLocaleString()} bytes)`
    );
    console.log(
      `Tree size:  ${(treeSize / 1024 / 1024).toFixed(2)} MB (${treeSize.toLocaleString()} bytes)`
    );
    console.log(
      `Bytes per word (array): ${(totalArraySize / words.length).toFixed(2)}`
    );
    console.log(
      `Bytes per word (tree):  ${(treeSize / words.length).toFixed(2)}`
    );
    // Tree should ideally be smaller due to prefix sharing
    if (treeSize < totalArraySize) {
      console.log(`\n✓ Tree is more memory efficient`);
    } else {
      console.log(`\n✗ Array is more memory efficient`);
    }
  });
});
