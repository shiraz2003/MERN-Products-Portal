/**
 * Utility functions for handling image URLs
 */

// Backend server URL
const BACKEND_URL = 'http://localhost:5000';

/**
 * Get a complete image URL by adding the backend server URL if needed
 * @param {string} imagePath - The image path from the backend
 * @returns {string} - Complete image URL
 */
export const getCompleteImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // If it's already a complete URL (http/https) or a data URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }
    
    // Otherwise, prepend the backend server URL
    return `${BACKEND_URL}${imagePath}`;
};
