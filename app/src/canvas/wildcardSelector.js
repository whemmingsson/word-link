export class WildcardSelector {
  constructor() {
    this.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");
    this.numberOfColumns = 7;
    this.cellSize = 40;
    this.width = 400;
    this.height = 350;
    this.x = width / 2 - this.width / 2;
    this.y = height / 2 - this.height / 2;
    this.startX = this.x + 40;
    this.startY = this.y + 80;
  }

  _mouseIsOver(x, y) {
    return (
      mouseX > x &&
      mouseX < x + this.cellSize &&
      mouseY > y &&
      mouseY < y + this.cellSize
    );
  }

  render() {
    // Semi-transparent overlay
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    // White dialog box
    fill(255);
    rect(this.x, this.y, this.width, this.height, 10);

    // Title
    fill(0);
    textSize(20);
    textAlign(CENTER);
    text("Select a letter for wildcard:", width / 2, this.y + 40);

    // Draw letter grid (A-Z)
    for (let i = 0; i < this.letters.length; i++) {
      const col = i % this.numberOfColumns;
      const row = Math.floor(i / this.numberOfColumns);
      const x = this.startX + col * (this.cellSize + 5);
      const y = this.startY + row * (this.cellSize + 5);

      // Highlight on hover
      if (this._mouseIsOver(x, y)) {
        fill(200, 220, 255);
        cursor(HAND);
      } else {
        fill(240);
      }

      rect(x, y, this.cellSize, this.cellSize, 5);
      fill(0);
      textSize(24);
      text(this.letters[i], x + this.cellSize / 2, y + this.cellSize / 2);
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
