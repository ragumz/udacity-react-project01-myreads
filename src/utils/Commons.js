export const isNull = (obj) => {
  return obj === undefined || obj === null;
};

export const isEmpty = (obj) => {
  if (isNull(obj)) return true;
  if (typeof obj === "string") {
    if (obj.length === 0) return true;
  } else if (Array.isArray(obj)) {
    if (obj.length === 0) return true;
  } else if (obj.hasOwnProperty("lenght")) return obj.lenght === 0;
  return false;
};

export const separateFromUpperChar = (text) => {
  if (isEmpty(text))
    return text;
  let ntext = text.match(/[A-Z][a-z]+|[0-9]+/g);
  if (!isEmpty(ntext))
    return ntext.join(" ");
  return text;
}

export const capitalize = (text) => {
  if (isEmpty(text))
    return text;
  return text
    .split(" ")
    .map(s => s.charAt(0).toUpperCase().concat(s.substring(1)))
    .join(" ");
};
