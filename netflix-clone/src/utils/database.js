// Utility functions for offline storage using IndexedDB
import { openDB } from 'idb';

const DB_NAME = 'netflixClone';
const DB_VERSION = 1;

const STORES = {
    MEDIA: 'media',
    WATCHLIST: 'watchlist',
    WATCH_HISTORY: 'watch_history',
    API_CACHE: 'api_cache'
};

let db = null;

/**
 * Initialize IndexedDB
 */
async function initDB() {
    if (db) return db;

    try {
        db = await openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Media store for caching API responses
                if (!db.objectStoreNames.contains(STORES.MEDIA)) {
                    const mediaStore = db.createObjectStore(STORES.MEDIA, { keyPath: 'id' });
                    mediaStore.createIndex('title', 'title', { unique: false });
                    mediaStore.createIndex('category', 'category', { unique: false });
                    mediaStore.createIndex('cached_at', 'cached_at', { unique: false });
                }

                // Watchlist store
                if (!db.objectStoreNames.contains(STORES.WATCHLIST)) {
                    const watchlistStore = db.createObjectStore(STORES.WATCHLIST, { keyPath: 'id' });
                    watchlistStore.createIndex('added_at', 'added_at', { unique: false });
                }

                // Watch history store
                if (!db.objectStoreNames.contains(STORES.WATCH_HISTORY)) {
                    const historyStore = db.createObjectStore(STORES.WATCH_HISTORY, { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('media_id', 'media_id', { unique: false });
                    historyStore.createIndex('watched_at', 'watched_at', { unique: false });
                }

                // API cache metadata
                if (!db.objectStoreNames.contains(STORES.API_CACHE)) {
                    const cacheStore = db.createObjectStore(STORES.API_CACHE, { keyPath: 'key' });
                    cacheStore.createIndex('expires_at', 'expires_at', { unique: false });
                }
            }
        });

        return db;
    } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
        return null;
    }
}

/**
 * Get all media from database
 */
export async function getAllMedia() {
    try {
        const database = await initDB();
        if (!database) return [];
        return await database.getAll(STORES.MEDIA);
    } catch (error) {
        console.error('Error getting media from DB:', error);
        return [];
    }
}

/**
 * Add or update media in database
 */
export async function saveMedia(mediaArray) {
    try {
        const database = await initDB();
        if (!database) return false;

        const tx = database.transaction(STORES.MEDIA, 'readwrite');
        const store = tx.objectStore(STORES.MEDIA);

        const timestamp = Date.now();
        for (const media of mediaArray) {
            await store.put({
                ...media,
                cached_at: timestamp
            });
        }

        await tx.done;
        return true;
    } catch (error) {
        console.error('Error saving media to DB:', error);
        return false;
    }
}

/**
 * Get media by ID
 */
export async function getMediaById(id) {
    try {
        const database = await initDB();
        if (!database) return null;
        return await database.get(STORES.MEDIA, id);
    } catch (error) {
        console.error('Error getting media by ID:', error);
        return null;
    }
}

/**
 * Add to watchlist
 */
export async function addToWatchlist(media) {
    try {
        const database = await initDB();
        if (!database) return false;

        await database.put(STORES.WATCHLIST, {
            ...media,
            added_at: Date.now()
        });

        return true;
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return false;
    }
}

/**
 * Remove from watchlist
 */
export async function removeFromWatchlist(mediaId) {
    try {
        const database = await initDB();
        if (!database) return false;

        await database.delete(STORES.WATCHLIST, mediaId);
        return true;
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return false;
    }
}

/**
 * Get watchlist
 */
export async function getWatchlist() {
    try {
        const database = await initDB();
        if (!database) return [];

        const tx = database.transaction(STORES.WATCHLIST, 'readonly');
        const store = tx.objectStore(STORES.WATCHLIST);
        const index = store.index('added_at');

        return await index.getAll();
    } catch (error) {
        console.error('Error getting watchlist:', error);
        return [];
    }
}

/**
 * Check if media is in watchlist
 */
export async function isInWatchlist(mediaId) {
    try {
        const database = await initDB();
        if (!database) return false;

        const item = await database.get(STORES.WATCHLIST, mediaId);
        return !!item;
    } catch (error) {
        console.error('Error checking watchlist:', error);
        return false;
    }
}

/**
 * Add to watch history
 */
export async function addToWatchHistory(mediaId, mediData) {
    try {
        const database = await initDB();
        if (!database) return false;

        await database.add(STORES.WATCH_HISTORY, {
            media_id: mediaId,
            media_data: mediData,
            watched_at: Date.now()
        });

        return true;
    } catch (error) {
        console.error('Error adding to watch history:', error);
        return false;
    }
}

/**
 * Get watch history
 */
export async function getWatchHistory() {
    try {
        const database = await initDB();
        if (!database) return [];

        const tx = database.transaction(STORES.WATCH_HISTORY, 'readonly');
        const store = tx.objectStore(STORES.WATCH_HISTORY);
        const index = store.index('watched_at');

        // Get all and sort by watched_at descending
        const allHistory = await index.getAll();
        return allHistory.reverse();
    } catch (error) {
        console.error('Error getting watch history:', error);
        return [];
    }
}

/**
 * Clear old cache entries
 */
export async function clearOldCache(expirationHours = 24) {
    try {
        const database = await initDB();
        if (!database) return;

        const expirationTime = Date.now() - (expirationHours * 60 * 60 * 1000);

        const tx = database.transaction(STORES.API_CACHE, 'readwrite');
        const store = tx.objectStore(STORES.API_CACHE);
        const index = store.index('expires_at');

        const range = IDBKeyRange.upperBound(expirationTime);
        const keysToDelete = await index.getAllKeys(range);

        for (const key of keysToDelete) {
            await store.delete(key);
        }

        await tx.done;
    } catch (error) {
        console.error('Error clearing old cache:', error);
    }
}

/**
 * Store API cache metadata
 */
export async function cacheAPIResponse(key, expirationHours = 24) {
    try {
        const database = await initDB();
        if (!database) return;

        const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);

        await database.put(STORES.API_CACHE, {
            key,
            expires_at: expiresAt,
            cached_at: Date.now()
        });
    } catch (error) {
        console.error('Error caching API response:', error);
    }
}
