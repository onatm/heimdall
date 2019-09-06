/* eslint-disable import/prefer-default-export */
const parseAsArray = (str) => {
  if (!str) {
    return [];
  }

  return str.trim().split(' ').filter(s => !!s);
};

export { parseAsArray };
