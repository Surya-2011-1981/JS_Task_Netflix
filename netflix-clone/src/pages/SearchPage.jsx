// Search Page - Full search interface
import React, { useCallback, useState } from 'react';
import { useAsync } from '../hooks';
import * as apiService from '../services/api';
import * as db from '../utils/database';
import { SearchBar } from '../components/SearchBar';
import { MediaGrid } from '../components/MediaCard';
import { PreviewModal } from '../components/Modal';
import { ListSkeleton } from '../components/Skeleton';
import './Search.css';

export function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [watchlist, setWatchlist] = useState([]);

    // Load watchlist
    const { execute: loadWatchlist } = useAsync(async () => {
        const dbWatchlist = await db.getWatchlist();
        setWatchlist(dbWatchlist);
    }, false);

    const { execute: performSearch, isLoading } = useAsync(
        async (query) => {
            if (!query || query.length < 2) {
                setSearchResults([]);
                return;
            }

            const results = await apiService.searchMedia(query);
            setSearchResults(results);
        },
        false
    );

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        performSearch(query);
    }, [performSearch]);

    const handleCardClick = useCallback((media) => {
        setSelectedMedia(media);
        setIsModalOpen(true);
    }, []);

    const handleWatchlistToggle = useCallback(async (mediaId, add) => {
        try {
            if (add) {
                const media = searchResults.find((m) => m.id === mediaId);
                if (media) {
                    await db.addToWatchlist(media);
                    setWatchlist((prev) => [...prev, media]);
                }
            } else {
                await db.removeFromWatchlist(mediaId);
                setWatchlist((prev) => prev.filter((m) => m.id !== mediaId));
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error);
        }
    }, [searchResults]);

    const isMediaInWatchlist = useCallback((mediaId) => {
        return watchlist.some((m) => m.id === mediaId);
    }, [watchlist]);

    React.useEffect(() => {
        loadWatchlist();
    }, [loadWatchlist]);

    return (
        <div className="search-page">
            <div className="search-page-container">
                {/* Search Header */}
                <div className="search-header">
                    <h1>Search for Shows & Movies</h1>
                    <p>Discover thousands of titles to watch</p>
                </div>

                {/* Search Bar */}
                <div className="search-bar-wrapper">
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Search by title, genre, year..."
                    />
                </div>

                {/* Results */}
                {searchQuery && (
                    <div className="search-results-section">
                        <div className="results-header">
                            <h2>
                                Results for "{searchQuery}" ({searchResults.length} found)
                            </h2>
                        </div>

                        {isLoading ? (
                            <ListSkeleton count={12} />
                        ) : searchResults.length > 0 ? (
                            <MediaGrid
                                items={searchResults}
                                onCardClick={handleCardClick}
                                onWatchlistToggle={handleWatchlistToggle}
                            />
                        ) : (
                            <div className="search-no-results">
                                <div className="no-results-illustration">
                                    🔍
                                </div>
                                <h3>No results found</h3>
                                <p>Try searching with different keywords</p>
                            </div>
                        )}
                    </div>
                )}

                {!searchQuery && (
                    <div className="search-empty">
                        <div className="empty-illustration">
                            🎬
                        </div>
                        <h2>Start searching to discover content</h2>
                        <p>Search by title, genre, year, or actor name</p>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <PreviewModal
                media={selectedMedia}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onWatchlistToggle={(add) => handleWatchlistToggle(selectedMedia?.id, add)}
                inWatchlist={selectedMedia ? isMediaInWatchlist(selectedMedia.id) : false}
            />
        </div>
    );
}
