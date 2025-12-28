export const styleUtils = {
  sketch: {
    backgroundColor: "#000000f0",
  },
  tile: {
    fillColorLive: "#ffffffde",
    fillColorPlaced: "#ddddddde",
    textColor: "#000000ff",
    borderColorLive: "rgba(216, 216, 216, 1)",
    borderColorPlaced: "#bbbbbbde",
  },
  letterBar: {
    backgroundColor: "#383838ff",
    borderColor: "#ccccccff",
  },
  grid: {
    fillColor: "#1b1b1bf0",
    lineColor: "#ccc",
    cell: {
      shaded: {
        fillColor: "#eeeeeec2",
      },
      textColor: "#ffffffff",
    },
    specialTiles: {
      0: { color: "#2a2a2a", text: "" }, // Empty
      1: { color: "#3a4a58", text: "DL" }, // DoubleLetter - Dark blue-gray
      2: { color: "#2a3844", text: "TL" }, // TripleLetter - Darker gray-blue
      3: { color: "#4a4238", text: "DW" }, // DoubleWord - Dark warm gray
      4: { color: "#3a2e24", text: "TW" }, // TripleWord - Darker warm brown-gray
    },
  },
};
