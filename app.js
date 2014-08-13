var express = require('express');
var session = require('express-session');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var serveStatic = require('serve-static');

var config = require('./config');

/***** Setup express.js *****/

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(session({
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true
}));
app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());
app.use(serveStatic('assets', {
	index: false,
	redirect: false
}));

/** routes **/

app.get('/', function (req, res) {
	res.render('index');
});

var server = app.listen(config.port, function () {
	console.log('Listening on port %d', server.address().port);
});
