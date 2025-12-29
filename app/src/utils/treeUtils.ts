import type { Node } from "../types/Node";

export const buildTree = (words: string[]): Node => {
  const root: Node = {
    subWord: "[root]",
    children: new Map<string, Node>(),
    isEndOfWord: false,
  };
  for (const word of words) {
    let node = root;
    const letters = word.trim().toUpperCase().split("");
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      node = getOrCreateNode(node, letter!);
    }
    node.isEndOfWord = true; // Mark the end of the word
  }
  optimizeTree(root);
  return root;
};

export const optimizeTree = (node: Node): void => {
  // First optimize all children recursively
  for (const childNode of node.children.values()) {
    optimizeTree(childNode);
  }

  // Then merge single-child chains in this node's children
  const newChildren = new Map<string, Node>();

  for (const [_, childNode] of node.children) {
    // Merge consecutive single-child nodes
    while (childNode.children.size === 1 && !childNode.isEndOfWord) {
      const [nextLetter, nextNode] = Array.from(
        childNode.children.entries()
      )[0]!;
      // Merge childNode with nextNode
      childNode.subWord += nextLetter;
      childNode.children = nextNode.children;
      childNode.isEndOfWord = nextNode.isEndOfWord!; // Preserve word ending flag
    }

    // Use the merged subWord as the new key
    newChildren.set(childNode.subWord, childNode);
  }

  node.children = newChildren;
};

export const getOrCreateNode = (root: Node, letter: string): Node => {
  if (!root.children.has(letter)) {
    const newNode: Node = {
      subWord: letter,
      children: new Map<string, Node>(),
      isEndOfWord: false,
    };
    root.children.set(letter, newNode);
    return newNode;
  } else {
    return root.children.get(letter)!;
  }
};

export const countNodes = (node: Node): number => {
  let count = 1;
  for (const child of node.children.values()) {
    count += countNodes(child);
  }
  return count;
};

// Radix trie version
export const hasWord = (node: Node, word: string): boolean => {
  if (!word) return false;

  const searchWord = word.toUpperCase();
  let currentNode = node;
  let position = 0;

  while (position < searchWord.length) {
    let found = false;
    const remainingLength = searchWord.length - position;

    // Check all child edges to find a matching prefix
    for (const [edgeLabel, childNode] of currentNode.children.entries()) {
      const edgeLength = edgeLabel.length;

      // Quick check: if edge is longer than remaining word, skip
      if (edgeLength > remainingLength) {
        continue;
      }

      // Quick check: compare first character to avoid unnecessary iteration
      if (searchWord[position] !== edgeLabel[0]) {
        continue;
      }

      // Check if edge matches character by character (avoid substring creation)
      let matches = true;
      for (let i = 0; i < edgeLength; i++) {
        if (searchWord[position + i] !== edgeLabel[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        position += edgeLength;
        currentNode = childNode;
        found = true;
        break;
      }
    }

    if (!found) {
      return false;
    }
  }

  // For radix trie, must check if this node marks end of a word
  return currentNode.isEndOfWord === true;
};

export const renderTree = () => {};
