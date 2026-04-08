// Custom hooks

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MediaContext } from '../context/MediaContext';
import { OfflineContext } from '../context/OfflineContext';

/**
 * useAuth hook - Access authentication context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

/**
 * useMedia hook - Access media context
 */
export function useMedia() {
    const context = useContext(MediaContext);
    if (!context) {
        throw new Error('useMedia must be used within MediaProvider');
    }
    return context;
}

/**
 * useOffline hook - Access offline context
 */
export function useOffline() {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within OfflineProvider');
    }
    return context;
}

/**
 * useAsync hook - Handle async operations with loading/error states
 */
export function useAsync(asyncFunction, immediate = true) {
    const [status, setStatus] = useState('idle');
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

    const execute = async (...args) => {
        setStatus('pending');
        setValue(null);
        setError(null);

        try {
            const response = await asyncFunction(...args);
            setValue(response);
            setStatus('success');
            return response;
        } catch (err) {
            setError(err);
            setStatus('error');
            throw err;
        }
    };

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate]);

    return {
        execute,
        status,
        value,
        error,
        isLoading: status === 'pending',
        isError: status === 'error',
        isSuccess: status === 'success'
    };
}

/**
 * useLocalStorage hook - Persist state to localStorage
 */
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
        }
    };

    return [storedValue, setValue];
}

/**
 * useDebouncedValue hook - Debounced value changes
 */
export function useDebouncedValue(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * useWindowSize hook - Get window dimensions
 */
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowSize;
}

/**
 * useIntersectionObserver hook - Lazy load images/content
 */
export function useIntersectionObserver(ref, options = {}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, {
            threshold: 0.01,
            ...options
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, options]);

    return isVisible;
}

/**
 * useMount hook - Run function on mount only
 */
export function useMount(callback) {
    useEffect(() => {
        callback();
    }, [callback]);
}

/**
 * useUnmount hook - Run function on unmount only
 */
export function useUnmount(callback) {
    useEffect(() => {
        return () => {
            callback();
        };
    }, [callback]);
}

/**
 * usePrevious hook - Get previous value
 */
export function usePrevious(value) {
    const [previous, setPrevious] = useState();

    useEffect(() => {
        setPrevious(value);
    }, [value]);

    return previous;
}

/**
 * useToggle hook - Simple boolean toggle
 */
export function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);

    const toggle = () => {
        setValue((v) => !v);
    };

    return [value, toggle];
}

/**
 * useAbortController hook - Cleanup fetch requests on unmount
 */
export function useAbortController() {
    const [abortController, setAbortController] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setAbortController(controller);

        return () => {
            controller.abort();
        };
    }, []);

    return abortController;
}
