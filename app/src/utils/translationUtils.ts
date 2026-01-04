export const translate = (key: string) => {
  if (window.translationService) {
    return window.translationService.translate(key);
  }
  return key;
};

export const translateFormatted = (key: string, ...args: string[]) => {
  if (window.translationService) {
    return window.translationService.translateFormatted(key, ...args);
  }
  return key;
};
