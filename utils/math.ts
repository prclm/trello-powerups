export const range = (min: number, max?: number, step = 1) => {
  if (!max) {
    max = min;
    min = 1;
  }
  const array = [];
  for (let i = min; i <= max; i += step) {
    array.push(i);
  }
  return array;
};

export const randomInt = (min = 1, max?: number) => {
  if (!max) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
