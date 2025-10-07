import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for API calls with built-in loading, error handling, and toast notifications
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, execute, reset }
 */
export function useApi(apiFunction, options = {}) {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation successful',
    errorMessage = 'Operation failed',
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...params);
        const responseData = response?.data || response;
        
        setData(responseData);
        
        if (showSuccessToast) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess(responseData);
        }
        
        return responseData;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || errorMessage;
        setError(errorMsg);
        
        if (showErrorToast) {
          toast.error(errorMsg);
        }
        
        if (onError) {
          onError(err);
        }
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}