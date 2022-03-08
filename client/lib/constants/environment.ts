// access correct env variable
const NODE_ENV = process.env.NODE_ENV || process.env.NEXT_PUBLIC_NODE_ENV;

// runtime environment checks
export const IS_PRODUCTION: boolean = NODE_ENV === 'production';
export const IS_DEVELOPMENT: boolean = NODE_ENV === 'development' || NODE_ENV === 'test' || NODE_ENV === undefined;
