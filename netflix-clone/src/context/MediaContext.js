// Media Context - Media data and filtering state
import React, { createContext, useCallback, useReducer, useState } from 'react';

export const MediaContext = createContext();

// Action types
const ACTIONS = {
    SET_MEDIA: 'SET_MEDIA',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_FILTER: 'SET_FILTER',
    ADD_TO_WATCHLIST: 'ADD_TO_WATCHLIST',
    REMOVE_FROM_WATCHLIST: 'REMOVE_FROM_WATCHLIST',
    UPDATE_WATCH_HISTORY: 'UPDATE_WATCH_HISTORY'
};

const initialState = {
    allMedia: [],
    filteredMedia: [],
    isLoading: false,
    error: null,
    filter: 'All',
    watchlist: [],
    watchHistory: [],
    totalCount: 0
};

function mediaReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_MEDIA:
            return {
                ...state,
                allMedia: action.payload.data || [],
                totalCount: action.payload.total || 0,
                filteredMedia: action.payload.data || [],
                isLoading: false
            };

        case ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
                error: null
            };

        case ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case ACTIONS.SET_FILTER: {
            const category = action.payload;
            let filtered = state.allMedia;

            if (category !== 'All') {
                filtered = state.allMedia.filter((item) => item.category === category);
            }

            return {
                ...state,
                filter: category,
                filteredMedia: filtered
            };
        }

        case ACTIONS.ADD_TO_WATCHLIST:
            return {
                ...state,
                watchlist: [...state.watchlist, action.payload]
            };

        case ACTIONS.REMOVE_FROM_WATCHLIST:
            return {
                ...state,
                watchlist: state.watchlist.filter((item) => item.id !== action.payload)
            };

        case ACTIONS.UPDATE_WATCH_HISTORY:
            return {
                ...state,
                watchHistory: [action.payload, ...state.watchHistory]
            };

        default:
            return state;
    }
}

export function MediaProvider({ children }) {
    const [state, dispatch] = useReducer(mediaReducer, initialState);
    const [searchQuery, setSearchQuery] = useState('');

    const setMedia = useCallback((mediaData) => {
        dispatch({
            type: ACTIONS.SET_MEDIA,
            payload: mediaData
        });
    }, []);

    const setLoading = useCallback((isLoading) => {
        dispatch({
            type: ACTIONS.SET_LOADING,
            payload: isLoading
        });
    }, []);

    const setError = useCallback((error) => {
        dispatch({
            type: ACTIONS.SET_ERROR,
            payload: error
        });
    }, []);

    const setFilter = useCallback((category) => {
        dispatch({
            type: ACTIONS.SET_FILTER,
            payload: category
        });
    }, []);

    const addToWatchlist = useCallback((media) => {
        dispatch({
            type: ACTIONS.ADD_TO_WATCHLIST,
            payload: media
        });
    }, []);

    const removeFromWatchlist = useCallback((mediaId) => {
        dispatch({
            type: ACTIONS.REMOVE_FROM_WATCHLIST,
            payload: mediaId
        });
    }, []);

    const addToWatchHistory = useCallback((media) => {
        dispatch({
            type: ACTIONS.UPDATE_WATCH_HISTORY,
            payload: {
                ...media,
                watchedAt: Date.now()
            }
        });
    }, []);

    const value = {
        ...state,
        setMedia,
        setLoading,
        setError,
        setFilter,
        addToWatchlist,
        removeFromWatchlist,
        addToWatchHistory,
        searchQuery,
        setSearchQuery
    };

    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}
