// Home Page - Main landing page
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedia, useAsync, useAbortController } from '../hooks';
import * as apiService from '../services/api';
import * as db from '../utils/database';
import { Hero } from '../components/Hero';
import { MediaGrid } from '../components/MediaCard';
import { PreviewModal } from '../components/Modal';
import { HeroSkeleton, RowSkeleton } from '../components/Skeleton';
import './Home.css';

export function HomePage() {
    const navigate = useNavigate();
    const { setMedia, setLoading, filteredMedia, allMedia } = useMedia();
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [watchlist, setWatchlist] = useState([]);
    const [tvShows, setTvShows] = useState([]);
    const [movies, setMovies] = useState([]);

    const abortController = useAbortController();

    // Load media
    const { isLoading } = useAsync(async () => {
        try {
            setLoading(true);

            // Fetch all media
            const allMediaData = await apiService.getAllMedia({ limit: 50000, offset: 0 });
            const mediaItems = allMediaData.data || allMediaData;

            // Save to IndexedDB
            await db.saveMedia(mediaItems);

            //Separate by category
            const shows = mediaItems.filter((m) => m.category === 'TV Shows');
            const moviesData = mediaItems.filter((m) => m.category === 'Movies');

            setMedia({
                data: mediaItems,
                total: mediaItems.length
            });

            setTvShows(shows);
            setMovies(moviesData);

            // Load watchlist from DB
            const dbWatchlist = await db.getWatchlist();
            setWatchlist(dbWatchlist);

            // Add to watch history
            if (mediaItems.length > 0) {
                await db.addToWatchHistory('home_visit', {
                    type: 'page_view',
                    page: 'home'
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading home page:', error);
            setLoading(false);
        }
    }, true);

    const handleCardClick = useCallback((media) => {
        setSelectedMedia(media);
        setIsModalOpen(true);
    }, []);

    const handleWatchlistToggle = useCallback(async (mediaId, add) => {
        try {
            if (add) {
                const media = allMedia.find((m) => m.id === mediaId);
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
    }, [allMedia]);

    const isMediaInWatchlist = useCallback((mediaId) => {
        return watchlist.some((m) => m.id === mediaId);
    }, [watchlist]);

    const featuredMedia = filteredMedia.find((m) => m.featured) || filteredMedia[0];

    return (
        <div className="home-page">
            {/* Hero Section */}
            {isLoading ? (
                <HeroSkeleton />
            ) : (
                featuredMedia && (
                    <Hero
                        media={featuredMedia}
                        onPlayClick={() => navigate(`/watch/${featuredMedia.id}`)}
                        onMoreInfoClick={() => handleCardClick(featuredMedia)}
                    />
                )
            )}

            {/* Content Container */}
            <div className="home-container">
                {/* TV Shows Section */}
                <section className="home-section">
                    <div className="section-header">
                        <h2>Trending Shows</h2>
                        <button
                            className="section-link"
                            onClick={() => navigate('/tv-shows')}
                        >
                            View All →
                        </button>
                    </div>
                    {isLoading ? (
                        <RowSkeleton />
                    ) : (
                        <MediaGrid
                            items={tvShows.slice(0, 12)}
                            onCardClick={handleCardClick}
                            onWatchlistToggle={handleWatchlistToggle}
                        />
                    )}
                </section>

                {/* Movies Section */}
                <section className="home-section">
                    <div className="section-header">
                        <h2>Popular Movies</h2>
                        <button
                            className="section-link"
                            onClick={() => navigate('/movies')}
                        >
                            View All →
                        </button>
                    </div>
                    {isLoading ? (
                        <RowSkeleton />
                    ) : (
                        <MediaGrid
                            items={movies.slice(0, 12)}
                            onCardClick={handleCardClick}
                            onWatchlistToggle={handleWatchlistToggle}
                        />
                    )}
                </section>

                {/* Continue Watching Section (from watch history) */}
                <section className="home-section">
                    <div className="section-header">
                        <h2>For You</h2>
                    </div>
                    {isLoading ? (
                        <RowSkeleton />
                    ) : (
                        <MediaGrid
                            items={filteredMedia.slice(0, 12)}
                            onCardClick={handleCardClick}
                            onWatchlistToggle={handleWatchlistToggle}
                        />
                    )}
                </section>
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
