export const translate = (key) => {
  if (window.translationService) {
    return window.translationService.translate(key);
  }
  return key;
};

export const translateFormatted = (key, ...args) => {
  if (window.translationService) {
    return window.translationService.translateFormatted(key, ...args);
  }
  return key;
};
