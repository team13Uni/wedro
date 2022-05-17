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


/**
 * User defined type guard, which guarantees 'object is T', not undefined, not null
 * @see https://2ality.com/2020/06/type-guards-assertion-functions-typescript.html#user-defined-type-guards
 * @param {T | undefined | null} variable
 * @return {object is T}
 */
export const isDefined = <T>(variable: T | undefined | null): variable is NonNullable<T> => variable !== undefined && variable !== null;

/**
 * Generic array of objects sorter
 * @author filipditrich
 * @param {keyof T} prop
 * @param {SortOptions} options
 * @returns {(a: T, b: T) => number}
 */
export const sortBy =
  <T extends Record<string | number | symbol, any>>(
    prop: keyof T,
    options: SortOptions = {}
  ) =>
  (a: T, b: T): number =>
    sorter<T[keyof T]>(a[prop], b[prop], options);

/**
 * Generic sorter function
 * @author filipditrich
 * @param {T} a
 * @param {T} b
 * @param {SortOptions} options
 * @returns {number}
 */
export const sorter = <T extends Primitive>(
  a: T,
  b: T,
  options: SortOptions
): number => {
  let comparison = 0;
  if (typeof a === "string" && typeof b === "string")
    comparison = a.localeCompare(b);
  else if (a instanceof Date && b instanceof Date)
    comparison = a.getTime() - b.getTime();
  else if (typeof a === "bigint" && typeof b === "bigint")
    comparison = Number(a) - Number(b);
  else comparison = (a as number) - (b as number);

  return options.direction === "asc" ? -comparison : comparison;
};

/**
 * Options for sort functions
 * @export
 */
export type SortOptions = {
  direction?: "asc" | "desc" | null;
};

type Primitive = string | number | null | undefined | boolean | bigint;

// Calculates number of days in year
export function daysInYear(year: number) {
  return (year % 4 === 0 && year % 100 > 0) || year % 400 == 0 ? 366 : 365;
}
