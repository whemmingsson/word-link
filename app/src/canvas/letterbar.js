export class Letterbar {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.letters = [];
    this.lettersOnGrid = [];
    this.mouseOverLetter = null;
  }

  drawLetterbar() {
    fill("#f0f0f0");
    stroke("#ccc");
    strokeWeight(1);
    rect(this.x, this.y, this.width, this.height);
    this.drawLetters();
  }

  drawLetters() {
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    let mouseOverAnyLetter = false;
    this.mouseOverLetter = null;
    for (let i = 0; i < this.letters.length; i++) {
      // Skip rendering if this letter is being dragged from the bar
      if (
        window.gameContext.letterBeeingDragged &&
        window.gameContext.dragSource === "bar" &&
        this.letters[i] === window.gameContext.letterBeeingDragged
      ) {
        continue;
      }

      const letter = this.letters[i].letter;
      const x =
        this.x +
        i * window.gameContext.cellSize * 1.5 +
        window.gameContext.cellSize / 2;
      const y = this.y + this.height / 2;
      const mX = mouseX;
      const mY = mouseY;

      if (
        mX > x - window.gameContext.cellSize / 2 &&
        mX < x + window.gameContext.cellSize / 2 &&
        mY > y - window.gameContext.cellSize / 2 &&
        mY < y + window.gameContext.cellSize / 2
      ) {
        fill("#ddd");
        rect(
          x - window.gameContext.cellSize / 2,
          y - window.gameContext.cellSize / 2,
          window.gameContext.cellSize,
          window.gameContext.cellSize
        );
        fill(0);
        mouseOverAnyLetter = true;
        this.mouseOverLetter = this.letters[i];
      }

      fill("#ffe881ff");
      rect(
        x - window.gameContext.cellSize / 2,
        y - window.gameContext.cellSize / 2,
        window.gameContext.cellSize,
        window.gameContext.cellSize
      );
      fill(0);
      text(letter, x, y);
      noFill();
    }

    if (mouseOverAnyLetter) {
      cursor(HAND);
    } else {
      cursor(ARROW);
    }
  }

  mouseIsOver() {
    const mX = mouseX;
    const mY = mouseY;
    return (
      mX >= this.x &&
      mX < this.x + this.width &&
      mY >= this.y &&
      mY < this.y + this.height
    );
  }

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.width;
  }

  init() {
    if (window.letterPoolService) {
      this.letters = window.letterPoolService.drawLetters(7);
    }
  }

  getMouseOverLetter() {
    return this.mouseOverLetter;
  }

  getLetterAtPosition(x, y) {
    // Larger hit area for better touch support (1.2x the cell size)
    const hitAreaMultiplier = 1.2;
    for (let i = 0; i < this.letters.length; i++) {
      const letterX =
        this.x +
        i * window.gameContext.cellSize * 1.5 +
        window.gameContext.cellSize / 2;
      const letterY = this.y + this.height / 2;

      const hitSize = (window.gameContext.cellSize * hitAreaMultiplier) / 2;

      if (
        x > letterX - hitSize &&
        x < letterX + hitSize &&
        y > letterY - hitSize &&
        y < letterY + hitSize
      ) {
        return this.letters[i];
      }
    }
    return null;
  }

  removeLetter(letterObj) {
    const beforeCount = this.letters.length;
    this.letters = this.letters.filter((l) => l !== letterObj);
    const afterCount = this.letters.length;
    console.log(
      `removeLetter: "${
        letterObj.letter
      }", before: ${beforeCount}, after: ${afterCount}, removed: ${
        beforeCount - afterCount
      }`
    );
    this.lettersOnGrid.push(letterObj.letter);
  }

  addLetter(letter) {
    this.letters.push(letter);
    this.lettersOnGrid = this.lettersOnGrid.filter((l) => l !== letter);
  }
}
