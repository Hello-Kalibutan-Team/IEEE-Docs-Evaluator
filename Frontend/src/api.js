const API_BASE_URL = 'http://localhost:8080/api';

export const verifyStudentWithBackend = async (googleName, googleEmail) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: googleName, email: googleEmail })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to verify user with the server.');
    }

    return await response.json();
};