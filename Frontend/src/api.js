const API_BASE_URL = 'http://localhost:8080/api';

/**
 * AUTH: Verifies user against Google Sheets allowlist
 */
export const verifyStudentWithBackend = async (googleName, googleEmail) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: googleName, email: googleEmail })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to verify user.');
    }
    return await response.json();
};

/**
 * DRIVE: Fetches files from a specific folder (Now used for Nested Navigation)
 */
export const getDriveFiles = async (folderId) => {
    const response = await fetch(`${API_BASE_URL}/drive/files/${folderId}`);
    if (!response.ok) throw new Error('Could not load folder contents.');
    return await response.json();
};

/**
 * DRIVE: Deletes a specific file or folder
 */
export const deleteDriveFile = async (fileId) => {
    const response = await fetch(`${API_BASE_URL}/drive/files/${fileId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete file from Google Drive.');
    return true; 
};

/**
 * DRIVE: Creates a new folder
 */
export const createDriveFolder = async (folderName, parentId) => {
    const response = await fetch(`${API_BASE_URL}/drive/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName, parentId: parentId })
    });
    if (!response.ok) throw new Error('Failed to create folder.');
    return await response.json();
};

/**
 * DRIVE: Search Function
 */
export const searchDriveFiles = async (query) => {
    const response = await fetch(`${API_BASE_URL}/drive/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed.');
    return await response.json();
};

/**
 * DRIVE: Triggers the Java logic to read the Sheet, Route files, and fetch metadata
 */
export const syncSubmissionsWithBackend = async () => {
    const response = await fetch(`${API_BASE_URL}/drive/sync-submissions`);
    if (!response.ok) throw new Error('Submission sync failed.');
    return await response.json();
};