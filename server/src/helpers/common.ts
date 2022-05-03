/**
 * Picks specified props from provided object
 * @param {T} base
 * @param {K} keys
 * @return {Pick<T, K>}
 */
export const pickFrom = <T extends object, K extends keyof T>(
  base: T,
  ...keys: K[]
): Pick<T, K> => {
  const entries = keys.map((key) => [key, base[key]]);
  return Object.fromEntries(entries);
};

/**
 * Omits specified props from provided object
 * @param {T} base
 * @param {K} keys
 * @returns {Omit<T, K>}
 */
export const omitFrom = <T extends object, K extends keyof T>(
  base: T,
  ...keys: K[]
): Omit<T, K> => {
  const entries = (Object.keys(base) as K[])
    .filter((k) => !keys.includes(k))
    .map((key) => [key, base[key]]);
  return Object.fromEntries(entries);
};
