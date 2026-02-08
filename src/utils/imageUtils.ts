
export const getOptimizedImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;

    // Handle Google Drive links
    // From: https://drive.google.com/file/d/FILE_ID/view...
    // To: https://drive.google.com/uc?export=view&id=FILE_ID
    if (url.includes('drive.google.com')) {
        // Pattern 1: /file/d/ID/view
        const matchFile = url.match(/\/file\/d\/([^/]+)/);
        if (matchFile && matchFile[1]) {
            return `https://drive.google.com/uc?export=view&id=${matchFile[1]}`;
        }

        // Pattern 2: id=ID
        const matchId = url.match(/[?&]id=([^&]+)/);
        if (matchId && matchId[1]) {
            return `https://drive.google.com/uc?export=view&id=${matchId[1]}`;
        }
    }

    return url;
};
