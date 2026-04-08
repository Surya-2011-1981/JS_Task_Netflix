// Offline Context - Connection status and offline behavior
import React, { createContext, useCallback, useEffect, useState } from 'react';

export const OfflineContext = createContext();

export function OfflineProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastOnlineTime, setLastOnlineTime] = useState(Date.now());
    const [connectionHistory, setConnectionHistory] = useState([
        {
            type: 'online',
            timestamp: Date.now()
        }
    ]);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        setLastOnlineTime(Date.now());
        setConnectionHistory((prev) => [
            ...prev,
            {
                type: 'online',
                timestamp: Date.now()
            }
        ]);

        // Dispatch event for potential content refresh
        window.dispatchEvent(new CustomEvent('app:online'));
    }, []);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        setConnectionHistory((prev) => [
            ...prev,
            {
                type: 'offline',
                timestamp: Date.now()
            }
        ]);

        window.dispatchEvent(new CustomEvent('app:offline'));
    }, []);

    // Listen to online/offline events
    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    const value = {
        isOnline,
        lastOnlineTime,
        connectionHistory,
        isOffline: !isOnline,
        wasRecentlyOnline: Date.now() - lastOnlineTime < 5000
    };

    return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}
