// Search Bar Component with debounced suggestions
import React, { useCallback, useState } from 'react';
import { useDebouncedValue, useAsync } from '../hooks';
import * as apiService from '../services/api';
import './SearchBar.css';

export function SearchBar({ onSearch, placeholder = "Search shows, movies, games..." }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Debounce search query
    const debouncedQuery = useDebouncedValue(query, 300);

    // Fetch suggestions
    const { execute: fetchSuggestions, isLoading: isSearching } = useAsync(
        async (q) => {
            if (!q || q.length < 2) {
                setSuggestions([]);
                return [];
            }

            const results = await apiService.searchMedia(q);
            // Limit suggestions to 5
            const limited = results.slice(0, 5);
            setSuggestions(limited);
            return limited;
        },
        false // Don't execute immediately
    );

    // Trigger search when debounced query changes
    React.useEffect(() => {
        if (debouncedQuery) {
            fetchSuggestions(debouncedQuery);
        } else {
            setSuggestions([]);
        }
    }, [debouncedQuery, fetchSuggestions]);

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(value.length > 0);
    }, []);

    const handleSearch = useCallback(() => {
        if (onSearch && query.trim()) {
            onSearch(query);
            setIsOpen(false);
            setQuery('');
        }
    }, [query, onSearch]);

    const handleSuggestionClick = useCallback((suggestion) => {
        setQuery(suggestion.title);
        if (onSearch) {
            onSearch(suggestion.title);
        }
        setIsOpen(false);
    }, [onSearch]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    return (
        <div className="search-bar-container">
            <div className="search-bar-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>

                <input
                    type="text"
                    className="search-input"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsOpen(query.length > 0)}
                    aria-label="Search"
                    autocomplete="off"
                />

                {query && (
                    <button
                        className="search-clear-btn"
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                            setIsOpen(false);
                        }}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}

                {isSearching && (
                    <div className="search-loading">
                        <span className="loading-spinner" />
                    </div>
                )}
            </div>

            {/* Suggestions dropdown */}
            {isOpen && (query.length > 0) && (
                <div className="search-suggestions">
                    {isSearching ? (
                        <div className="suggestions-loading">
                            <p>Searching...</p>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion) => (
                                <li key={suggestion.id} className="suggestion-item">
                                    <button
                                        className="suggestion-btn"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        <span className="suggestion-image-placeholder">
                                            <img
                                                src={suggestion.poster}
                                                alt={suggestion.title}
                                                className="suggestion-image"
                                                width="30"
                                                height="44"
                                            />
                                        </span>
                                        <div className="suggestion-info">
                                            <span className="suggestion-title">{suggestion.title}</span>
                                            <span className="suggestion-meta">
                                                {suggestion.category} • {suggestion.releaseYear}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="suggestions-empty">
                            <p>No results found for "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
