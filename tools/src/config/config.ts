import dotenv from "dotenv";

dotenv.config();

interface Config {
  wordListPath: string;
  wordListPathFiltered: string;
  wordListPathExample?: string;
}

const config: Config = {
  wordListPath: process.env.WORD_LIST_SRC || "",
  wordListPathFiltered: process.env.WORD_LIST_SRC_FILTERED || "",
  wordListPathExample: process.env.WORD_LIST_SRC_EXAMPLE || "",
};

export default config;
