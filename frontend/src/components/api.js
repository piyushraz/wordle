const backendUrl = 'https://wordle-production-5838.up.railway.app';

function api_getUsername(cb) {
    let url = `${backendUrl}/api/username`;
    fetch(url, {
        method: "GET", 
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => cb(data))
    .catch(error => console.error('Error fetching username:', error));
}

function api_guess(username, guess, cb) {
    let url = `${backendUrl}/api/username/${username}/guess/${guess}`;
    fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess })
    })
    .then(response => response.json())
    .then(data => cb(data))
    .catch(error => console.error('Error making guess:', error));
}

function api_newgame(username, cb) {
    let url = `${backendUrl}/api/username/${username}/newgame`;
    fetch(url, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => cb(data))
    .catch(error => console.error('Error starting new game:', error));
}

function api_getUserStats(username, cb) {
    let url = `${backendUrl}/api/username/${username}/stats`;
    fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => cb(data))
    .catch(error => console.error('Error fetching user stats:', error));
}

export { api_getUsername, api_guess, api_newgame, api_getUserStats };
