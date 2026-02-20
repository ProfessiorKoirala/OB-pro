import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
    // Helper to get matches, ensures it's safe on server-side rendering
    const getMatches = (q: string): boolean => {
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
            return window.matchMedia(q).matches;
        }
        return false;
    };

    const [matches, setMatches] = useState<boolean>(getMatches(query));

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        
        // Listener function
        const handleChange = () => {
            setMatches(getMatches(query));
        };
        
        // Set the initial state correctly (and update on query change)
        handleChange();

        // Add the listener
        mediaQueryList.addEventListener('change', handleChange);
        
        // Cleanup listener on unmount
        return () => {
            mediaQueryList.removeEventListener('change', handleChange);
        };
    }, [query]); // Only re-run the effect if the query changes

    return matches;
};
