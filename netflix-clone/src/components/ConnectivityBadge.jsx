// Connectivity Badge - Shows online/offline status
import React from 'react';
import { useOffline } from '../hooks';
import './ConnectivityBadge.css';

export function ConnectivityBadge() {
    const { isOnline } = useOffline();

    if (isOnline) {
        return null; // Don't show when online
    }

    return (
        <div className="connectivity-badge offline">
            <span className="connectivity-icon" />
            <span>You're offline - browsing cached content</span>
        </div>
    );
}
