function api_getUsername(cb){
	let url="/api/username";
	fetch(url, {
		method: "GET", 
		mode: "same-origin", 
		cache: "no-cache", 
		credentials: "same-origin", 
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: "follow", 
		referrerPolicy: "no-referrer", 
	})
	.then(response=>response.json())
	.then(data=>cb(data))
	.catch(error=>console.log(error));
}

function api_guess(username, guess, cb){
	let url="/api/username/"+username+"/guess/"+guess;
	fetch(url, {
        method: "POST",
        mode: "same-origin",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
    })
    .then(response => response.json())
    .then(data => cb(data))
    .catch(error => console.log(error));
}

function api_newgame(username, cb){
    let url="/api/username/"+username+"/newgame";
    fetch(url, {
        method: "PUT",
        mode: "same-origin",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
    })
    .then(response => response.json())
    .then(data => cb(data))
    .catch(error => console.log(error));
}

  function api_getUserStats(username, cb) {
    let url = "/api/username/"+username+"/stats";
    fetch(url, {
        method: "GET",
        mode: "same-origin",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
    })
    .then(response => response.json())
    .then(data => cb(data))
    .catch(error => console.log(error));
}

export { api_getUsername, api_guess, api_newgame, api_getUserStats }; 

