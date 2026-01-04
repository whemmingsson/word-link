import { translate } from "./translationUtils.js";
export class WildcardSelector {
  constructor(p5) {
    this.p5 = p5;
    this.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");
    this.numberOfColumns = 7;
    this.cellSize = 40;
    this.width = 400;
    this.height = 350;
    this.x = this.p5.width / 2 - this.width / 2;
    this.y = this.p5.height / 2 - this.height / 2;
    this.startX = this.x + 40;
    this.startY = this.y + 80;
  }

  _mouseIsOver(x, y) {
    return (
      this.p5.mouseX > x &&
      this.p5.mouseX < x + this.cellSize &&
      this.p5.mouseY > y &&
      this.p5.mouseY < y + this.cellSize
    );
  }

  render() {
    // Semi-transparent overlay
    this.p5.fill(0, 0, 0, 180);
    this.p5.rect(0, 0, this.p5.width, this.p5.height);

    // White dialog box
    this.p5.fill(255);
    this.p5.rect(this.x, this.y, this.width, this.height, 10);

    // Title
    this.p5.fill(0);
    this.p5.textSize(20);
    this.p5.textAlign(this.p5.CENTER);
    this.p5.text(translate("select_letter"), this.p5.width / 2, this.y + 40);

    // Draw letter grid (A-Z)
    for (let i = 0; i < this.letters.length; i++) {
      const col = i % this.numberOfColumns;
      const row = Math.floor(i / this.numberOfColumns);
      const x = this.startX + col * (this.cellSize + 5);
      const y = this.startY + row * (this.cellSize + 5);

      // Highlight on hover
      if (this._mouseIsOver(x, y)) {
        this.p5.fill(200, 220, 255);
        this.p5.cursor(this.p5.HAND);
      } else {
        this.p5.fill(240);
      }

      this.p5.rect(x, y, this.cellSize, this.cellSize, 5);
      this.p5.fill(0);
      this.p5.textSize(24);
      this.p5.text(
        this.letters[i],
        x + this.cellSize / 2,
        y + this.cellSize / 2
      );
    }
  }

  getSelectedLetter() {
    // Check which letter was clicked
    for (let i = 0; i < this.letters.length; i++) {
      const col = i % this.numberOfColumns;
      const row = Math.floor(i / this.numberOfColumns);
      const x = this.startX + col * (this.cellSize + 5);
      const y = this.startY + row * (this.cellSize + 5);
      // Check if mouse is within this letter's bounds
      if (this._mouseIsOver(x, y)) {
        return this.letters[i];
      }
    }
    // If clicked outside the letter grid but inside the modal, do nothing
    return null;
  }
}
