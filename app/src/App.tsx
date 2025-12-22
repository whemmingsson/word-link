import "./App.css";
import { Board } from "./components/Board";
import { LetterBar } from "./components/LetterBar";

function App() {
  return (
    <>
      <h1>Word Link</h1>
      <Board />
      <LetterBar />
    </>
  );
}

export default App;
