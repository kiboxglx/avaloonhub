export const googleDriveService = {
    // Extract Folder ID from various Google Drive link formats
    extractFolderId: (url) => {
        if (!url) return null;
        try {
            // Format 1: https://drive.google.com/drive/folders/ID
            // Format 2: https://drive.google.com/drive/u/0/folders/ID
            const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
            if (folderMatch && folderMatch[1]) {
                return folderMatch[1];
            }

            // Format 3: https://drive.google.com/open?id=ID
            const urlObj = new URL(url);
            const idParam = urlObj.searchParams.get('id');
            if (idParam) {
                return idParam;
            }

            return null;
        } catch (e) {
            console.error("Invalid URL format:", url);
            return null;
        }
    },

    // Get file count from a public folder ID
    // Throws an error with a human-readable message on failure
    getFileCount: async (folderId) => {
        if (!folderId) throw new Error("ID de pasta inválido.");

        const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
        if (!apiKey) {
            throw new Error("Chave da API do Google Drive não configurada no .env");
        }

        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name)&key=${apiKey}`
        );

        // Parse the body regardless of status to get Google's error message
        const data = await response.json();

        if (!response.ok) {
            // Google returns { error: { code, message, status } }
            const googleMessage = data?.error?.message || `Erro HTTP ${response.status}`;
            const googleStatus = data?.error?.status || "";
            console.error("Google Drive API Error:", data);
            throw new Error(googleMessage, { cause: googleStatus });
        }

        return data.files ? data.files.length : 0;
    }
};

