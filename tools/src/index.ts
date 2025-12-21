import config from "./config/config";
import { readFileAsLines, writeAsJsVariable } from "./fileUtils";
import { filter } from "./filter";

import { buildTree, countNodes, hasWord } from "../../common/utils/treeUtils";

const main = async () => {
  console.log(`Word list path: ${config.wordListPath}`);

  const words = await readFileAsLines(`${config.wordListPathFiltered!}`);
  writeAsJsVariable(
    `${config.wordListPathFiltered!}`.replace(".txt", ".ts"),
    "words",
    words
  );
  const tree = buildTree(words);
};

main();
