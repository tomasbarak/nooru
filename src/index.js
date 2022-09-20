require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');
const oauth2 = require('simple-oauth2');
const path = require('path');
const crypto = require('crypto');
const credentials = {
    client: {
        id: process.env.spotify_client_id, // Change this!
        secret: process.env.spotify_client_secret, // Change this!
    },
    auth: {
        tokenHost: 'https://api.spotify.com',
        tokenPath: '/oauth/access_token'
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

app.all('/spotify-callback', (req, res) => {
    console.log(req);
});

app.listen(port, function () {
    console.log('Listening on port ' + port);

    
});


app.get('/redirect', (req, res) => {
    // Generate a random state verification cookie.
    const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
    // Allow unsecure cookies on localhost.
    const secureCookie = req.get('host').indexOf('localhost:') !== 0;
    res.cookie('state', state.toString(), {maxAge: 3600000, secure: secureCookie, httpOnly: true});
    const redirectUri = client.authorizeURL({
      redirect_uri: `${req.protocol}://${req.get('host')}/spotify-callback`,
      scope: 'basic',
      state: state
    });
    res.redirect(redirectUri);
  });