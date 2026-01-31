export const RATE_LIMITS = {
    api: {
        max: 2,
        windowMs: 60000,
        message: 'Too many API calls, please try again soon.',
        name: 'api',
    },
    register: {
        max: 5,
        windowMs: 300000,
        message: 'Too many attempts, please try again in a few minutes.',
        name: 'register',
    },
};