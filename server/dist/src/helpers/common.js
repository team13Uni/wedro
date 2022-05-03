"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omitFrom = exports.pickFrom = void 0;
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
