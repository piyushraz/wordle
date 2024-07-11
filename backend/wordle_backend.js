const port = 8210;
const staticPort = 8211;
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const WebSocketServer = require('ws').Server;
const Wordle = require("./model.js");
const cors = require('cors');


const corsOptions = {
    origin: 'https://bejewelled-licorice-8fbb30.netlify.app/git add .', // Make sure to replace this with your actual Netlify domain
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static('static_files'));

const database = {};
var words = ["words"];
let randomWord;
var webSocketPort = staticPort + 1;
var connectedPlayers = [];
let firstWinnerOfRound = null;

/******************************************************************************
 * word routines
 ******************************************************************************/

fs.readFile('./words.5', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    words = data.split("\n");
    initNextResetTimeAndUpdateWord();
});

/******************************************************************************
 * middleware
 ******************************************************************************/

function getRandomWord(wordsArray) {
    return wordsArray[Math.floor(Math.random() * wordsArray.length)];
}

let nextResetTime;
const resetInterval = (5 * 60 * 1000) + 30 * 1000;

const initNextResetTimeAndUpdateWord = () => {
    nextResetTime = Date.now() + resetInterval;
    randomWord = getRandomWord(words);
    console.log(`The random word has been updated to: ${randomWord}`);
};

setInterval(() => {
    nextResetTime = Date.now() + resetInterval;
    for (let username in database) {
        if (database.hasOwnProperty(username)) {
            database[username].reset(randomWord);
        }
    }
    firstWinnerOfRound = null;
    initNextResetTimeAndUpdateWord();
}, resetInterval);

/******************************************************************************
 * Socket
 ******************************************************************************/

const wss = new WebSocketServer({ port: webSocketPort });

wss.on('close', function (code, data) {
    const reason = data.toString();
    console.log('disconnected');
});

wss.broadcast = function (message) {
    for (let ws of this.clients) {
        ws.send(message);
    }
};

wss.on('connection', function (ws) {
    ws.send(JSON.stringify({
        type: 'player-list-update',
        players: connectedPlayers
    }));
    for (let i = 0; i < connectedPlayers.length; i++) {
        ws.send(connectedPlayers[i]);
    }
    ws.on('message', function (data, isBinary) {
        try {
            const message = isBinary ? data : data.toString();
            const messageData = JSON.parse(message);
            if (!firstWinnerOfRound && messageData.action === "gameResult" && messageData.result === "won") {
                firstWinnerOfRound = messageData.username;
                const firstWins = database[firstWinnerOfRound].getWins();
                const firstLosses = database[firstWinnerOfRound].getLosses();
                wss.broadcast(JSON.stringify({
                    type: "first-winner",
                    username: firstWinnerOfRound,
                    firstWins: firstWins,
                    firstLosses: firstLosses
                }));
            }
        } catch (error) {
            const message = isBinary ? data : data.toString();
            if (message === "Clear-Players") {
                connectedPlayers = [];
                wss.broadcast(JSON.stringify({
                    type: 'player-list-update',
                    players: connectedPlayers
                }));
            } else {
                if (!connectedPlayers.includes(message)) {
                    connectedPlayers.push(message);
                    wss.broadcast(JSON.stringify({
                        type: 'player-list-update',
                        players: connectedPlayers
                    }));
                }
            }
        }
    });

    const sendTimeLeft = () => {
        const currentTime = Date.now();
        const timeLeft = Math.max(nextResetTime - currentTime, 0);
        ws.send(JSON.stringify({
            type: "time-update",
            timeLeft
        }));
    };

    sendTimeLeft();
    const timeInterval = setInterval(sendTimeLeft, 1000);

    ws.on('close', () => {
        console.log("Client disconnected");
        clearInterval(timeInterval);
    });
});

/******************************************************************************
 * routes
 ******************************************************************************/

app.get('/api/username/', function (req, res) {
    let username;
    if (req.cookies.username) {
        username = req.cookies.username;
    } else {
        let wordle = new Wordle(words);
        username = wordle.getUsername();
        res.cookie('username', username, { maxAge: 1.5 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
    }
    res.status(200);
    res.json({ "username": username });
});

app.put('/api/username/:username/newgame', function (req, res) {
    let username = req.params.username;
    if (!(username in database)) {
        let wordle = new Wordle(words);
        wordle.setUsername(username);
        wordle.setTargetWord(randomWord);
        database[username] = wordle;
        database[username].state = "play";
    } else {
        database[username].reset(randomWord);
        database[username].state = "play";
    }
    res.status(200);
    res.json({ "status": "created" });
});

app.post('/api/username/:username/guess/:guess', function (req, res) {
    let username = req.params.username;
    let guess = req.params.guess;
    if (!(username in database)) {
        res.status(409);
        res.json({ "error": `${username} does not have an active game` });
        return;
    }
    var data = database[username].makeGuess(guess);
    if (data.success) {
        if (database[username].state === 'won' || database[username].state === 'lost') {
            data.correctWord = randomWord;
        }
        res.status(200);
        res.json(data);
    } else {
        res.status(400);
        res.json(data);
    }
});

app.get('/api/username/:username/stats', function (req, res) {
    let username = req.params.username;
    if (!(username in database)) {
        res.status(404);
        res.json({ "error": `No stats found for ${username}` });
        return;
    }
    let userStats = {
        wins: database[username].won,
        losses: database[username].lost
    };
    res.status(200);
    res.json(userStats);
});

// Add a route to handle the root path
app.get('/', (req, res) => {
    res.send('Welcome to the Wordle Backend API');
});

app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});
