export const refreshAccessToken = async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');

    try {
        const response = await fetch('http://localhost:3000/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (data.token) {
            sessionStorage.setItem('sessionToken', data.token);
            return data.token;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        // Handle failed refresh (e.g., redirect to login)
        window.location.href = '/login';
    }
}; 