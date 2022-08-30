const express = require('express');
const app = express();
const port = 3000;

var path = require ('path');
app.use(express.static(path.join(__dirname + '/public/')));

//Use EJS as view engine
app.set('view engine', 'ejs');

app.get('/', function (req, res){
    //Use ejs to render index.ejs
    res.render(__dirname + '/public/html/index.ejs');
});

app.listen(port, function(){
    console.log('Listening on port ' + port);
});