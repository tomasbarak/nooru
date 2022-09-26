require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');
const oauth2 = require('simple-oauth2');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const credentials = {
    client: {
        id: process.env.spotify_client_id, // Change this!
        secret: process.env.spotify_client_secret, // Change this!
    },
    auth: {
        tokenHost: 'https://accounts.spotify.com',
        tokenPath: '/authorize'
    }
};

console.log(credentials)
const client = new AuthorizationCode(credentials);
const port = 3000;

app.use(cookieParser())
app.use(express.static(path.join(__dirname + '/public/')));

//Use EJS as view engine
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    //Use ejs to render index.ejs
    res.render(__dirname + '/public/html/index.ejs');
});

app.all('/spotify-redirect', (req, res) => {
    if (!req.cookies.state) {
        res.status(400).send('State cookie not set or expired. Maybe you took too long to authorize. Please try again.');
        // Check the State Cookie is equal to the state parameter.
    } else if (req.cookies.state !== req.query.state) {
        res.status(400).send('State validation failed');
    }

    let body = {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: `${req.protocol}://${req.hostname}:3000/spotify-redirect`,
        client_id: process.env.spotify_client_id,
        client_secret: process.env.spotify_client_secret
    }

    const encoded = `?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${encodeURIComponent(`${req.protocol}://${req.hostname}:3000/spotify-redirect`)}&client_id=${process.env.spotify_client_id}&client_secret=${process.env.spotify_client_secret}`

    axios.post('https://accounts.spotify.com/api/token'+encoded).then((response) => {
        console.log(response.data)
        axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + response.data.access_token
            }
        }).then((response) => {
            console.log(response.data)
            res.send(response.data)
        }).catch((error) => {
            console.log(error)
        })
    }).catch((error) => {
        console.log(error)
        res.send(error)
    });
});

app.listen(port, function () {
    console.log('Listening on port ' + port);


});


app.get('/redirect', (req, res) => {
    const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
    const secureCookie = req.get('host').indexOf('localhost:') !== 0;
    res.cookie('state', state.toString(), { maxAge: 3600000, secure: secureCookie, httpOnly: true });
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${process.env.spotify_client_id}&response_type=code&redirect_uri=${req.protocol}://${req.get('host')}/spotify-redirect&scope=user-read-private%20user-read-email&state=${state}`);
});