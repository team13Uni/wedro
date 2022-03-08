import { isDefined, isEmpty, isOfType } from '@wedro/utils';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API endpoint URL
 */
export const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;
if (isEmpty(API_BASE)) throw new Error('Environmental variable "API_BASE" is not set!');

// global axios configuration
const axiosInstance: AxiosInstance = axios.create({
	baseURL: API_BASE,
});

// request interceptor - add auth token to every call
axiosInstance.interceptors.request.use(
	(config) => config,
	(error) => Promise.reject(error),
);

// response interceptor - format error
axiosInstance.interceptors.response.use(
	(res) => res,
	(error) => {
		try {
			// response received
			if (isOfType<AxiosError>(error, ['response']) && isDefined(error.response)) {
				throw new APIClientError(
					error.response.data.code || 'api_error',
					error.response.data?.messages?.en ||
						error.response.data?.messages?.cs ||
						error.response.data?.message ||
						'The server returned an error response and provided no further information about it.',
					error.response.status,
				);
			}

			// no response but request was made
			if (isOfType<AxiosError>(error, ['response']) && isDefined(error.request)) {
				throw new APIClientError('no_response', 'No response received. This most likely means the request has timed out.');
			}

			// unknown error
			throw new APIClientError('request_fail', 'Something happened in setting up the request that triggered an error.');
		} catch (clientError) {
			return Promise.reject(clientError);
		}
	},
);

/**
 * Custom API client error class
 * @extends Error
 */
export class APIClientError extends Error {
	constructor(public name: string, public message: string, public status: number = 500) {
		super();
	}
}

/**
 * Custom API client
 * @param config
 * @param token
 */
export const apiClient = async (config: AxiosRequestConfig, token?: string | null): Promise<AxiosResponse> => {
	return axiosInstance({
		...config,
		headers: {
			...config.headers,
			...(isEmpty(token) ? {} : { Authorization: `Bearer ${token}` }),
		},
	});
};
