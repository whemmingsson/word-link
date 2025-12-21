import { promises as fs } from "fs";

export const readFileAsLines = async (filePath: string): Promise<string[]> => {
  const content = await fs.readFile(filePath, "utf-8");
  return content.split("\n");
};

export const writeLinesToFile = async (
  filePath: string,
  lines: string[]
): Promise<void> => {
  const content = lines.join("\n");
  await fs.writeFile(filePath, content, "utf-8");
};

export const writeAsJsVariable = async (
  filePath: string,
  variableName: string,
  data: string[]
): Promise<void> => {
  const content = `export const ${variableName} = ${JSON.stringify(data, null, 2)};\n`;
  await fs.writeFile(filePath, content, "utf-8");
};
