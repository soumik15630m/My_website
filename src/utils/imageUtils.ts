
export const getOptimizedImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;

    // Handle Google Drive links
    // From: https://drive.google.com/file/d/FILE_ID/view...
    // To: https://drive.google.com/uc?export=view&id=FILE_ID
    if (url.includes('drive.google.com') && url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([^/]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
    }

    return url;
};
