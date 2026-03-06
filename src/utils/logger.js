/**
 * Avaloon Hub - Structured Logger Utility
 * Implements 12-factor app logging principles with JSON output and LGPD masking.
 */

// Keys that should have their values masked to protect PII and security
const SENSITIVE_KEYS = [
    'password', 'token', 'secret', 'cpf', 'credit_card',
    'auth_header', 'authorization', 'access_token', 'refresh_token',
    'apikey', 'api_key'
];

const MASK_STRING = '[REDACTED]';

/**
 * Recursively masks sensitive data within an object
 */
const maskSensitiveData = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle Dates, Arrays
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(maskSensitiveData);

    const maskedObj = { ...obj };
    for (const key in maskedObj) {
        if (Object.prototype.hasOwnProperty.call(maskedObj, key)) {
            const lowerKey = key.toLowerCase();
            const isSensitive = SENSITIVE_KEYS.some(sk => lowerKey.includes(sk));

            if (isSensitive && maskedObj[key]) {
                // If it's a string, mask it directly. If it's an object, mask structure
                maskedObj[key] = MASK_STRING;
            } else if (typeof maskedObj[key] === 'object' && maskedObj[key] !== null) {
                // Recursive call for nested objects
                maskedObj[key] = maskSensitiveData(maskedObj[key]);
            }
        }
    }
    return maskedObj;
};

/**
 * Base logger function that writes JSON to console
 */
const log = (level, eventType, message, context = {}, userId = null) => {
    // Basic structured payload
    const payload = {
        timestamp: new Date().toISOString(),
        level,
        service: 'avaloonhub-frontend',
        // In a real backend, correlation_id would come from request headers. 
        // Here we generate a simple random one for traceability within a session
        correlation_id: `req_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`,
        user_id: userId || 'anonymous',
        event_type: eventType,
        message,
        context: maskSensitiveData(context)
    };

    // Use specific console method based on level for browser filtering, 
    // but the output format remains stringified JSON for external ingestion
    const output = JSON.stringify(payload);

    switch (level) {
        case 'FATAL':
        case 'ERROR':
            console.error(output);
            break;
        case 'WARN':
            console.warn(output);
            break;
        case 'INFO':
            console.info(output);
            break;
        case 'DEBUG':
            // By default we can hide debug logs in production via environment check,
            // but for this implementation we log it.
            console.debug(output);
            break;
        default:
            console.log(output);
    }
};

// Export wrapper methods for each level
export const logger = {
    fatal: (eventType, message, context, userId) => log('FATAL', eventType, message, context, userId),
    error: (eventType, message, context, userId) => log('ERROR', eventType, message, context, userId),
    warn: (eventType, message, context, userId) => log('WARN', eventType, message, context, userId),
    info: (eventType, message, context, userId) => log('INFO', eventType, message, context, userId),
    debug: (eventType, message, context, userId) => log('DEBUG', eventType, message, context, userId),
};
