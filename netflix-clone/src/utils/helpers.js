// Debounce utility for expensive operations
export function debounce(func, delay) {
    let timeoutId;

    return function debounced(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

// Throttle utility for frequent events
export function throttle(func, limit) {
    let inThrottle;

    return function throttled(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// Check if device is online
export function isOnline() {
    return navigator.onLine;
}

// Generate unique IDs
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Format date
export function formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
}

// Safely parse JSON
export function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON parse error:', error);
        return fallback;
    }
}

// Truncate text
export function truncateText(text, length = 100) {
    if (!text) return '';
    return text.length > length ? text.slice(0, length) + '...' : text;
}

// Get initials from name
export function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Group array by key
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

// Shallow array/object clone
export function shallowClone(obj) {
    if (Array.isArray(obj)) {
        return [...obj];
    }
    if (obj !== null && typeof obj === 'object') {
        return { ...obj };
    }
    return obj;
}

// Path to image - with fallback
export function getImageUrl(imagePath) {
    if (!imagePath) {
        return 'https://via.placeholder.com/400x600?text=No+Image';
    }
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    return `${process.env.REACT_APP_API_BASE_URL}${imagePath}`;
}
