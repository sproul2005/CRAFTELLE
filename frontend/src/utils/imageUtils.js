export const getOptimizedUrl = (url, width = 500) => {
    if (!url || !url.includes('cloudinary')) return url;
    // Replace the '/upload/' segment with a resizing and auto-optimizing setup.
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};
