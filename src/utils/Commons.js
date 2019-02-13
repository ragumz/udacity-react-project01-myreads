/**
 * @description Check if an object is undefined or null.
 *
 * @param {any} obj Object to check
 * @return false if it is not null and not undefined
 */
export const isNull = (obj) => {
  return obj === undefined || obj === null;
};

/**
 * @description Check if an object is undefined, or null or
 * empty, such as an String, or Array or even an Object keys.
 *
 * @param {any} obj Object to check
 * @return false if it is not null, undefined or empty.
 */
export const isEmpty = (obj) => {
  if (isNull(obj)) return true;
  if (typeof obj === "string") {
    if (obj.length === 0) return true;
  } else if (Array.isArray(obj)) {
    if (Object.keys(obj).length === 0) return true;
  } else if (obj.hasOwnProperty("lenght")) return obj.lenght === 0;
  return false;
};

/**
 * @description Separate a text with joined capitalized words into a string with
 * separate words.
 * All words must start with an uppercase letter, including the first.
 * Eg.: 'IndustryIdentifiers' returns 'Industry Identifiers'
 *
 * @param {string} text A text such as attribute name of an object
 * @return An string with separated words
 */
export const separateFromUpperChar = (text) => {
  if (isEmpty(text))
    return text;
  let ntext = text.match(/[A-Z][a-z]+|[0-9]+/g);
  if (!isEmpty(ntext))
    return ntext.join(" ");
  return text;
}

/**
 * @description Capitalize the first letters of a text sentence.
 *
 * @param {*} text The sentence
 * @return The capitalized sentence
 */
export const capitalize = (text) => {
  if (isEmpty(text))
    return text;
  return text
    .split(" ")
    .map(s => s.charAt(0).toUpperCase().concat(s.substring(1)))
    .join(" ");
};
