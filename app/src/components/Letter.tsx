import type { LetterTile } from "../../../common/types/LetterTile";
import styles from "./Letter.module.css";
import { useDraggable } from "@dnd-kit/core";

interface LetterProps {
  letter: LetterTile;
  id: string;
}

export const Letter = ({ letter, id }: LetterProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { letter },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }
    : { cursor: "grab" };

  return (
    <div
      ref={setNodeRef}
      className={styles.letter}
      style={style}
      {...listeners}
      {...attributes}
    >
      {letter.letter || "🃏"}
    </div>
  );
};
