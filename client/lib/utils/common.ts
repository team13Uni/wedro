import { isEmpty as _isEmpty, isObject } from 'lodash';

/**
 * Return array of specified length
 * @param {number} length
 * @returns {number[]}
 */
export const arrayOf = (length: number) => Array.from(Array(length).keys());

/**
 * User defined type guard, which guarantees 'object is T', not undefined, not null
 * @see https://2ality.com/2020/06/type-guards-assertion-functions-typescript.html#user-defined-type-guards
 * @param {T | undefined | null} variable
 * @return {object is T}
 */
export const isDefined = <T>(variable: T | undefined | null): variable is NonNullable<T> => variable !== undefined && variable !== null;

/**
 * Type guard, which guarantees object is defined but empty
 * @param {"" | T | undefined | null} value
 * @return {value is "" | undefined | null}
 */
export const isEmpty = <T>(value: T | undefined | null | ''): value is undefined | null | '' => !isDefined(value) || value === '';

/**
 * Generic type guard
 * @see https://rangle.io/blog/how-to-use-typescript-type-guards/
 * @param varToBeChecked
 * @param {(keyof T)[]} propertiesToCheckFor
 * @return {varToBeChecked is T}
 */
export const isOfType = <T>(varToBeChecked: any, propertiesToCheckFor?: (keyof T)[]): varToBeChecked is T => {
	if (isEmpty(propertiesToCheckFor)) return isDefined(varToBeChecked);
	return !propertiesToCheckFor.map((propToCheck) => (varToBeChecked as T)?.[propToCheck] !== undefined).includes(false);
};

/**
 * Picks specified props from provided object
 * @param {T} base
 * @param {K} keys
 * @return {Pick<T, K>}
 */
export const pickFrom = <T extends object, K extends keyof T>(base: T, ...keys: K[]): Pick<T, K> => {
	const entries = keys.map((key) => [key, base[key]]);
	return Object.fromEntries(entries);
};

/**
 * Cleans object from falsy values such as `undefined`, `null`, empty object or empty string
 * @param {T} inputObject
 * @param {boolean} allowEmpty
 * @return {T}
 */
export const cleanObject = <T extends Record<string | number | symbol, any>>(inputObject: T, allowEmpty: boolean = false): T => {
	for (const propName in inputObject) {
		if (isObject(inputObject[propName])) {
			cleanObject(inputObject[propName]);
		}
		// delete undefined/null/empty or even empty string (if `allowEmpty` is false)
		if (
			!isDefined(inputObject[propName]) ||
			(!allowEmpty && _isEmpty(inputObject[propName])) ||
			(isObject(inputObject[propName]) && _isEmpty(inputObject[propName]))
		) {
			delete inputObject[propName];
		}
	}

	return inputObject;
};

/**
 * No-operation function
 * @return {void}
 */
export const noop = (): void => {};

/**
 * Truncates long string to the specified length
 * @param {string} text
 * @param {number} length
 * @return {string}
 */
export const truncate = (text: string, length: number): string => (text.length > length ? text.substr(0, length - 1) + '&hellip;' : text);

/**
 * Returns random integer from an interval
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const randomIntBetween = (min: number, max: number): number => Math.floor(randomNumBetween(min, max));

/**
 * Returns random number from an interval
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const randomNumBetween = (min: number, max: number): number => Math.random() * (max - min + 1) + min;

/**
 * Shuffles an array
 * @param array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};
