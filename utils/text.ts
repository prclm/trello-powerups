export const removeLineBreaks = (str: string): string => {
  return str.replace(/[\r\n]+/gm, " ");
};
