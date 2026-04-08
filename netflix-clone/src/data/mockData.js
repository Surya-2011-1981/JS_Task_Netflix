// Mock data generator for 10,000+ media items
import { generateId } from '../utils/helpers';

const TITLES = [
    'Stranger Things', 'The Crown', 'Bridgerton', 'The Witcher', 'Westworld',
    'Dark', 'Money Heist', 'Mindhunter', 'The Office', 'Friends',
    'Breaking Bad', 'Succession', 'The Boys', 'Squid Game', 'Wednesday',
    'Oppenheimer', 'Barbie', 'Inception', 'Interstellar', 'Tenet',
    'The Shawshank Redemption', 'The Dark Knight', 'Pulp Fiction', 'Fight Club', 'Matrix'
];

const GENRES = [
    'Drama', 'Thriller', 'Science Fiction', 'Crime', 'Fantasy',
    'Comedy', 'Action', 'Documentary', 'Horror', 'Romance',
    'Adventure', 'Mystery', 'Animation'
];

const DESCRIPTIONS = [
    'An exceptional story that will keep you on the edge of your seat.',
    'A masterpiece of cinema that defined a generation.',
    'Gripping narrative with complex characters and unexpected twists.',
    'A thrilling journey through time and space.',
    'Explore the depths of human nature in this compelling series.',
    'Award-winning production with stunning cinematography.',
    'A bittersweet tale of love, loss, and redemption.',
    'Mind-bending plot with multiple layers of storytelling.',
    'Hilarious comedy that will have you laughing out loud.',
    'An intimate look at the lives of ordinary people.'
];

const COUNTRIES = ['USA', 'UK', 'South Korea', 'Japan', 'Spain', 'France', 'Germany', 'India', 'Mexico', 'Canada'];

/**
 * Generate mock media data
 * @param {number} count - Number of items to generate
 * @returns {Array} Array of mock media items
 */
export function generateMockMedia(count = 10000) {
    const media = [];

    for (let i = 0; i < count; i++) {
        const title = TITLES[i % TITLES.length];
        const isShow = Math.random() > 0.4; // 60% shows, 40% movies
        const year = 2015 + Math.floor(Math.random() * 9); // 2015-2024

        const item = {
            id: i + 1, // Use predictable IDs
            title: `${title} ${isShow ? `- S${Math.floor(i / 100) + 1}` : `(${year})`}`,
            category: isShow ? 'TV Shows' : 'Movies',
            genre: GENRES[Math.floor(Math.random() * GENRES.length)],
            rating: (Math.random() * 5).toFixed(1),
            description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
            releaseYear: year,
            country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
            poster: `https://picsum.photos/400/600?random=${i}`,
            banner: `https://picsum.photos/1600/900?random=${i * 2}`,
            duration: isShow ? `${Math.floor(Math.random() * 10) + 1}h ${Math.floor(Math.random() * 60)}m` : `${Math.floor(Math.random() * 90) + 90}m`,
            watched: Math.random() > 0.8, // 20% watched
            inWatchlist: Math.random() > 0.9, // 10% in watchlist
            featured: i < 5, // First 5 items are featured
            votes: Math.floor(Math.random() * 100000)
        };

        media.push(item);
    }

    return media;
}

/**
 * Get featured media (for hero section)
 */
export function getFeaturedMedia(allMedia) {
    return allMedia.filter((item) => item.featured).slice(0, 1);
}

/**
 * Get trending media
 */
export function getTrendingMedia(allMedia, count = 20) {
    return allMedia
        .sort((a, b) => b.votes - a.votes)
        .slice(0, count);
}

/**
 * Get media by category
 */
export function getMediaByCategory(allMedia, category) {
    return allMedia.filter((item) => item.category === category);
}

/**
 * Get media by genre
 */
export function getMediaByGenre(allMedia, genre) {
    return allMedia.filter((item) => item.genre === genre);
}

/**
 * Search media
 */
export function searchMedia(allMedia, query) {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();

    return allMedia.filter((item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.genre.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.releaseYear.toString() === query
    );
}

// Cache for generated data
let cachedData = null;

/**
 * Get all mock media (cached)
 */
export function getAllMockMedia() {
    if (!cachedData) {
        cachedData = generateMockMedia(10000);
    }
    return cachedData;
}

/**
 * Reset cache
 */
export function resetMockDataCache() {
    cachedData = null;
}
