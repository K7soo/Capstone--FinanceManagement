// Function to get CSRF token from the browser's cookies
function getCsrfToken() {
    let csrfToken = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith('csrftoken=')) {
                csrfToken = trimmedCookie.split('=')[1];
            }
        });
    }
    return csrfToken;
}