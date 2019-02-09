export const isNull = (obj) => {
  return obj === undefined || obj === null;
};

export const isEmpty = (obj) => {
  if (isNull(obj))
    return true;
  if (typeof(obj) === 'string') {
    if (obj.length === 0)
      return true;
  } else if (Array.isArray(obj)) {
    if (obj.length === 0)
      return true;
  } else if (obj.hasOwnProperty('lenght'))
      return obj.lenght === 0;
  return false;
};