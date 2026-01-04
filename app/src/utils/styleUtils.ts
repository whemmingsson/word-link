import { translate } from "./translationUtils.js";

import { p } from "./p5Utils.js";

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
    markedLetterBorderColor: "#ffcc00ff",
  },
  grid: {
    centerShapeFillColor: "#b0b0b0ff",
    fillColor: "#1b1b1bf0",
    lineColor: "#ccc",
    cell: {
      shaded: {
        fillColor: "#eeeeeec2",
      },
      textColor: "#ffffffff",
    },
    specialTiles: {
      0: { color: "#2a2a2a", text: "" },
      1: { color: "#3a4a58", text: translate("DL") },
      2: { color: "#2a3844", text: translate("TL") },
      3: { color: "#4a4238", text: translate("DW") },
      4: { color: "#3a2e24", text: translate("TW") },
    },
  },

  resetStyles() {
    p().noFill();
    p().strokeWeight(2);
    p().noStroke();
  },
};
