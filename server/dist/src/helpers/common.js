"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daysInYear = exports.sorter = exports.sortBy = exports.isDefined = exports.omitFrom = exports.pickFrom = void 0;
/**
 * Picks specified props from provided object
 * @param {T} base
 * @param {K} keys
 * @return {Pick<T, K>}
 */
const pickFrom = (base, ...keys) => {
    const entries = keys.map((key) => [key, base[key]]);
    return Object.fromEntries(entries);
};
exports.pickFrom = pickFrom;
/**
 * Omits specified props from provided object
 * @param {T} base
 * @param {K} keys
 * @returns {Omit<T, K>}
 */
const omitFrom = (base, ...keys) => {
    const entries = Object.keys(base)
        .filter((k) => !keys.includes(k))
        .map((key) => [key, base[key]]);
    return Object.fromEntries(entries);
};
exports.omitFrom = omitFrom;
/**
 * User defined type guard, which guarantees 'object is T', not undefined, not null
 * @see https://2ality.com/2020/06/type-guards-assertion-functions-typescript.html#user-defined-type-guards
 * @param {T | undefined | null} variable
 * @return {object is T}
 */
const isDefined = (variable) => variable !== undefined && variable !== null;
exports.isDefined = isDefined;
/**
 * Generic array of objects sorter
 * @author filipditrich
 * @param {keyof T} prop
 * @param {SortOptions} options
 * @returns {(a: T, b: T) => number}
 */
const sortBy = (prop, options = {}) => (a, b) => (0, exports.sorter)(a[prop], b[prop], options);
exports.sortBy = sortBy;
/**
 * Generic sorter function
 * @author filipditrich
 * @param {T} a
 * @param {T} b
 * @param {SortOptions} options
 * @returns {number}
 */
const sorter = (a, b, options) => {
    let comparison = 0;
    if (typeof a === "string" && typeof b === "string")
        comparison = a.localeCompare(b);
    else if (a instanceof Date && b instanceof Date)
        comparison = a.getTime() - b.getTime();
    else if (typeof a === "bigint" && typeof b === "bigint")
        comparison = Number(a) - Number(b);
    else
        comparison = a - b;
    return options.direction === "asc" ? -comparison : comparison;
};
exports.sorter = sorter;
// Calculates number of days in year
function daysInYear(year) {
    return (year % 4 === 0 && year % 100 > 0) || year % 400 == 0 ? 366 : 365;
}
exports.daysInYear = daysInYear;
