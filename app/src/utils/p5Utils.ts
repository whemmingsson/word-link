export const p = () => {
  if (typeof window !== "undefined" && window.p5) {
    return window.p5;
  }
  throw new Error("p5 instance is not available on window.");
};
