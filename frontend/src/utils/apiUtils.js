const apiConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001/api",
    timeout: 120000, // Default timeout
    headers: {
        "Content-Type": "application/json",
    },
    validateStatus: status => {
        return status < 500;
    }
};

// Log the baseURL for debugging
console.log("API Base URL:", apiConfig.baseURL);

// API timeout settings (in milliseconds)
const UPLOAD_TIMEOUT = 300000; // 300 seconds for uploads
const SIMULATION_TIMEOUT = 120000; // 120 seconds for simulation
const DEFAULT_TIMEOUT = 150000; // 150 seconds default

/**
 * Enhanced API error handling with detailed error extraction
 * @param {Error} error - The error object from axios
 * @returns {string} User-friendly error message
 */
const handleApiError = (error) => {
    console.error("API Error:", error);
    
    let errorMessage = "An unexpected error occurred";
    
    if (error.response) {
        const data = error.response.data;
        const status = error.response.status;
        
        if (data.error) {
            errorMessage = data.error;
        } else if (data.message) {
            errorMessage = data.message;
        } else if (data.detail) {
            errorMessage = data.detail;
        } else {
            switch (status) {
                case 400:
                    errorMessage = "Invalid request. Please check your input.";
                    break;
                case 401:
                    errorMessage = "Authentication required. Please log in.";
                    break;
                case 403:
                    errorMessage = "Access denied. You don't have permission.";
                    break;
                case 404:
                    errorMessage = "Resource not found.";
                    break;
                case 413:
                    errorMessage = "File too large. Maximum size is 10MB.";
                    break;
                case 422:
                    errorMessage = "Validation error. Please check your input.";
                    break;
                case 429:
                    errorMessage = "Too many requests. Please try again later.";
                    break;
                case 500:
                    errorMessage = "Server error. Please try again later.";
                    break;
                case 503:
                    errorMessage = "Service unavailable. Please try again later.";
                    break;
                default:
                    errorMessage = `Error ${status}: ${error.response.statusText}`;
            }
        }
    } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
    } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
    }
    
    return errorMessage;
};

/**
 * Retry logic for failed requests
 * @param {Function} fn - The function to retry
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Result of the function
 */
const retryRequest = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) {
            throw error;
        }
        
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
            throw error;
        }
        
        console.log(`Retrying request... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryRequest(fn, retries - 1, delay * 2);
    }
};

/**
 * Format API response for consistent handling
 * @param {Object} response - Axios response object
 * @returns {Object} Formatted response
 */
const formatResponse = (response) => {
    return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    };
};

export { 
    handleApiError, 
    UPLOAD_TIMEOUT, 
    SIMULATION_TIMEOUT, 
    DEFAULT_TIMEOUT,
    apiConfig,
    retryRequest,
    formatResponse
};