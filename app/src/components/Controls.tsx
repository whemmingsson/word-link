import type { MouseEvent } from "react";

export const Controls = () => {
  const handleOnClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Starting game...");
    const { createGame } = await import("../webrtc/webrtc-host");
    await createGame();
  };
  return (
    <div>
      <button type="button" onClick={(e) => handleOnClick(e)}>
        Start game
      </button>
    </div>
  );
};
