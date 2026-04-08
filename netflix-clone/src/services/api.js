// API Service Layer
// Handles all API calls with fallback to mock data

import axios from 'axios';
import * as mockDataService from '../data/mockData';
import * as db from '../utils/database';
import { isOnline } from '../utils/helpers';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com/v1';

// Create axios instance with timeout
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Track all active requests for cleanup
const activeRequests = new Map();

/**
 * Make API request with fallback to mock data
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} options - Additional options
 * @returns {Promise<Array>} Response data
 */
async function makeRequest(endpoint, method = 'GET', options = {}) {
    const requestKey = `${method}:${endpoint}`;

    // Cancel previous request if exists
    if (activeRequests.has(requestKey)) {
        activeRequests.get(requestKey).cancel('Request cancelled due to new request');
    }

    // Create abort controller for this request
    const abortController = new AbortController();
    const cancelToken = axios.CancelToken.source();
    activeRequests.set(requestKey, cancelToken);

    try {
        // Try to fetch from API if online
        if (isOnline()) {
            try {
                const response = await apiClient({
                    method,
                    url: endpoint,
                    cancelToken: cancelToken.token,
                    ...options
                });

                // Cache successful response
                if (response.status === 200) {
                    await db.cacheAPIResponse(requestKey);
                }

                activeRequests.delete(requestKey);
                return response.data;
            } catch (error) {
                // If API fails, try cache or mock data
                if (error.response?.status === 404 || error.response?.status === 500) {
                    console.warn(`API error at ${endpoint}, using fallback data`);
                }
            }
        }

        // Try to get from IndexedDB cache
        const cachedData = await db.getAllMedia();
        if (cachedData && cachedData.length > 0) {
            console.log('Using cached media data');
            activeRequests.delete(requestKey);
            return cachedData;
        }

        // Fall back to mock data
        console.log('Using mock data');
        const mockData = mockDataService.getAllMockMedia();

        // Cache the mock data for offline use
        await db.saveMedia(mockData);

        activeRequests.delete(requestKey);
        return mockData;
    } catch (error) {
        console.error(`Request failed for ${endpoint}:`, error);

        // Last resort: return mock data
        const mockData = mockDataService.getAllMockMedia();
        activeRequests.delete(requestKey);
        return mockData;
    }
}

/**
 * Get all media items
 */
export async function getAllMedia(options = {}) {
    const { limit = 100, offset = 0 } = options;

    // For demo, we'll use mock data directly
    // In production, this would be: GET /api/media?limit={limit}&offset={offset}
    const allMedia = await makeRequest('/media', 'GET', {
        params: { limit, offset }
    });

    // If we got actual data structure, return as-is
    // Otherwise process mock data
    if (Array.isArray(allMedia) && allMedia.length > 0) {
        return {
            data: Array.isArray(allMedia[0]) ? [] : allMedia,
            total: allMedia.length || 10000,
            limit,
            offset
        };
    }

    // Simulate pagination with mock data
    return {
        data: allMedia.slice(offset, offset + limit),
        total: allMedia.length,
        limit,
        offset
    };
}

/**
 * Get media by ID
 */
export async function getMediaById(id) {
    try {
        // Try database first
        const cached = await db.getMediaById(id);
        if (cached) return cached;

        // Try API
        if (isOnline()) {
            try {
                const response = await apiClient.get(`/media/${id}`);
                await db.saveMedia([response.data]);
                return response.data;
            } catch (error) {
                console.warn(`Failed to fetch media ${id} from API`);
            }
        }

        // Fall back to mock data
        const mockData = mockDataService.getAllMockMedia();
        const media = mockData.find((item) => item.id === parseInt(id));
        if (media) {
            await db.saveMedia([media]);
        }
        return media || null;
    } catch (error) {
        console.error(`Error getting media ${id}:`, error);
        return null;
    }
}

/**
 * Search media by query
 */
export async function searchMedia(query) {
    try {
        // For demo, search locally
        // In production: GET /api/media/search?q={query}

        if (!query || query.trim().length === 0) {
            return [];
        }

        // Get all media (from cache, API, or mock)
        const allMedia = await getAllMedia({ limit: 50000, offset: 0 });
        const mediaArray = allMedia.data || allMedia;

        // Local search
        const lowerQuery = query.toLowerCase();
        return mediaArray.filter((item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            (item.genre && item.genre.toLowerCase().includes(lowerQuery)) ||
            (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
            item.releaseYear.toString() === query
        );
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

/**
 * Get media by category
 */
export async function getMediaByCategory(category) {
    try {
        const allData = await getAllMedia({ limit: 50000, offset: 0 });
        const allMedia = allData.data || allData;

        return allMedia.filter((item) => item.category === category);
    } catch (error) {
        console.error(`Error getting media by category ${category}:`, error);
        return [];
    }
}

/**
 * Get trending media
 */
export async function getTrendingMedia(count = 20) {
    try {
        const allData = await getAllMedia({ limit: 50000, offset: 0 });
        const allMedia = allData.data || allData;

        return allMedia
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, count);
    } catch (error) {
        console.error('Error getting trending media:', error);
        return [];
    }
}

/**
 * Cancel all pending requests
 * Cleanup function to prevent memory leaks
 */
export function cancelAllRequests() {
    activeRequests.forEach((cancelToken) => {
        cancelToken.cancel('App unmounting');
    });
    activeRequests.clear();
}

/**
 * Get connection status
 */
export function getConnectionStatus() {
    return {
        isOnline: isOnline(),
        timestamp: Date.now()
    };
}

/**
 * Refresh content from API (if online)
 */
export async function refreshContent() {
    if (!isOnline()) {
        return {
            success: false,
            message: 'Offline - cannot refresh'
        };
    }

    try {
        // Clear API cache
        if ('serviceWorker' in navigator) {
            const sw = await navigator.serviceWorker.ready;
            if (sw.controller) {
                sw.controller.postMessage({ type: 'CLEAR_CACHE' });
            }
        }

        // Fetch fresh data
        const data = await getAllMedia({ limit: 50000, offset: 0 });

        return {
            success: true,
            message: 'Content refreshed',
            itemsCount: (data.data || data).length
        };
    } catch (error) {
        console.error('Error refreshing content:', error);
        return {
            success: false,
            message: 'Failed to refresh content'
        };
    }
}
