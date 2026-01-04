interface Translated<T> {
  sv: T;
  en: T;
}

const createTranslationMap = (): Map<string, Translated<string>> => {
  const map = new Map<string, Translated<string>>();

  map.set("start_game", { sv: "Starta spel", en: "Start Game" });
  map.set("abort_game", { sv: "Avbryt spel", en: "Abort Game" });
  map.set("play", { sv: "Spela", en: "Play" });
  map.set("reset", { sv: "Återställ", en: "Reset" });
  map.set("shuffle", { sv: "Blanda", en: "Shuffle" });
  map.set("switch_letters", { sv: "Byt", en: "Switch" });
  map.set("confirm_switch", {
    sv: "Bekräfta",
    en: "Confirm",
  });
  map.set("score_label", { sv: "Poäng: {0}", en: "Score: {0}" });
  map.set("last_word", {
    sv: "Senaste ord: {0} [{1}]",
    en: "Last word: {0} [{1}]",
  });
  map.set("no_letters_placed", {
    sv: "Inga bokstäver placerade på brädet",
    en: "No letters placed on the board",
  });
  map.set("invalid_letter_placement", {
    sv: "Ogiltig bokstavsplacering",
    en: "Invalid letter placement",
  });
  map.set("invalid_first_move", {
    sv: "Det första ordet måste placeras över mittenrutan",
    en: "The first word must cover the center square",
  });
  map.set("non_valid_word", {
    sv: 'Ordet "{0}" finns inte i ordlistan.',
    en: 'The word "{0}" is not valid.',
  });
  map.set("invalid_words", {
    sv: "Ett eller flera bildade ord hittades inte i ordlistan.",
    en: "One or more formed words are not valid.",
  });
  map.set("select_letter", {
    sv: "Välj en bokstav för jokertecken",
    en: "Select a letter for wildcard",
  });
  map.set("enable_zoom", {
    sv: "Zoom?",
    en: "Enable zoom",
  });
  map.set("reset_zoom", {
    sv: "Återställ zoom",
    en: "Reset zoom",
  });
  map.set("game_started", {
    sv: "Spelet har startat. Brädet sparas efter varje drag.",
    en: "The game has started. The board is saved after each move.",
  });
  map.set("dl", { sv: "DB", en: "DL" });
  map.set("tl", { sv: "TB", en: "TL" });
  map.set("dw", { sv: "DO", en: "DW" });
  map.set("tw", { sv: "TO", en: "TW" });
  return map;
};

export class TranslationService {
  language: keyof Translated<string>;
  map: Map<string, Translated<string>>;

  constructor() {
    this.language = "sv"; // default language
    this.map = createTranslationMap();
    console.log(
      "[core service] TranslationService initialized with language:",
      this.language
    );
  }

  _hasEntry(key: string): boolean {
    return this.map.has(key.toLowerCase());
  }

  _getEntry(key: string): Translated<string> {
    return this.map.get(key.toLowerCase())!;
  }

  translate(key: string): string {
    if (this._hasEntry(key)) {
      const entry = this._getEntry(key);
      return (
        entry[this.language] ||
        `Missing translation for key ${key} for language ${this.language}`
      );
    }
    return `Missing translation for key: ${key}`;
  }

  translateFormatted(key: string, ...args: string[]): string {
    if (!this._hasEntry(key) || !this._getEntry(key)[this.language]) {
      return `Missing translation for key ${key} for language ${this.language}`;
    }
    let translated = this.translate(key);
    args.forEach((arg, index) => {
      const placeholder = `{${index}}`;
      translated = translated.replace(placeholder, arg);
    });
    return translated;
  }
}

export const translationService = new TranslationService();
