import { describe, it, expect } from "vitest";

import { hasWord, buildTree } from "./treeUtils";

describe("hasWord", () => {
  it("should find words that exist in the tree", () => {
    const words = ["bokstav", "bok", "stav"];
    const tree = buildTree(words);

    expect(hasWord(tree, "bokstav")).toBe(true);
    expect(hasWord(tree, "bok")).toBe(true);
    expect(hasWord(tree, "stav")).toBe(true);
  });

  it("should not find words that don't exist in the tree", () => {
    const words = ["bokstav", "bok", "stav"];
    const tree = buildTree(words);

    expect(hasWord(tree, "stavbok")).toBe(false);
    expect(hasWord(tree, "hello")).toBe(false);
    expect(hasWord(tree, "")).toBe(false);
  });

  it("should handle case sensitivity correctly", () => {
    const words = ["bokstav", "Bok"];
    const tree = buildTree(words);

    expect(hasWord(tree, "bokstav")).toBe(true);
    expect(hasWord(tree, "BOKSTAV")).toBe(true);
    expect(hasWord(tree, "Bok")).toBe(true);
    expect(hasWord(tree, "bok")).toBe(true);
  });

  it("should work with an empty tree", () => {
    const words: string[] = [];
    const tree = buildTree(words);

    expect(hasWord(tree, "anything")).toBe(false);
  });

  it("should work with single character words", () => {
    const words = ["a", "b", "c"];
    const tree = buildTree(words);

    expect(hasWord(tree, "a")).toBe(true);
    expect(hasWord(tree, "b")).toBe(true);
    expect(hasWord(tree, "d")).toBe(false);
  });
});
