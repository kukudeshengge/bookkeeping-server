exports.calculateAdd = (list, key, callBack = () => true) => {
  return list.reduce((prev, next) => {
    if (callBack(next)) {
      if (typeof next === 'object') {
        next = next[key];
      }
      return Number(prev) + Number(next);
    }
    return prev;
  }, 0)?.toFixed(2);
};
