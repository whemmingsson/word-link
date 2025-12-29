import { readFileAsLines, writeLinesToFile } from "./fileUtils";

const filterFunc = (word: string) => {
  if (word.length === 0) return false;
  if (word.indexOf(" ") >= 0) return false;
  if (word.indexOf("-") >= 0) return false;
  if (word.indexOf("'") >= 0) return false;
  if (word.indexOf(".") >= 0) return false;
  if (word.length < 2) return false;
  if (word.length > 15) return false;
  return true;
};

const makeFilteredFilePath = (originalFilePath: string) => {
  return originalFilePath.replace(/(\.\w+)$/, "_filtered$1");
};

export const filter = async (filePath: string) => {
  console.log(`Filtering file: ${filePath}`);
  const words = await readFileAsLines(filePath);
  const filteredWords = words.filter(filterFunc);
  const filteredFilePath = makeFilteredFilePath(filePath);
  await writeLinesToFile(filteredFilePath, filteredWords);
};
