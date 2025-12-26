import "./App.css";
import { Board } from "./components/Board";
import { LetterBar } from "./components/LetterBar";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import type { LetterTile } from "../../common/types/LetterTile";
import { Controls } from "./components/Controls";
import { JoinHandler } from "./components/JoinHandler";

interface PlacedLetter {
  letter: LetterTile;
  x: number;
  y: number;
}

function App() {
  const [placedLetters, setPlacedLetters] = useState<PlacedLetter[]>([]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.data.current) {
      const letter = active.data.current.letter as LetterTile;
      const [x, y] = over.id.toString().split(",").map(Number);

      // Check if there's already a letter at this position
      const existingIndex = placedLetters.findIndex(
        (pl) => pl.x === x && pl.y === y
      );

      if (existingIndex >= 0) {
        // Replace existing letter
        const newPlacedLetters = [...placedLetters];
        newPlacedLetters[existingIndex] = { letter, x, y };
        setPlacedLetters(newPlacedLetters);
      } else {
        // Add new letter
        setPlacedLetters([...placedLetters, { letter, x, y }]);
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <JoinHandler />
      <h1>Word Link</h1>
      <Board placedLetters={placedLetters} />
      <LetterBar />
      <Controls />
    </DndContext>
  );
}

export default App;
