var express = require('express');
var session = require('express-session');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var serveStatic = require('serve-static');
var passport = require('passport');
var passportTwitter = require('passport-twitter');

var config = require('./config');

/***** Setup passport *****/

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new passportTwitter.Strategy({
		consumerKey: config.consumerKey,
		consumerSecret: config.consumerSecret,
		callbackURL: "http://127.0.0.1:8888/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done) {
		process.nextTick(function () {
			return done(null, profile);
		});
	}
));

var authenticatedOnly = function (req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login')
};

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
app.use(passport.initialize());
app.use(passport.session());
app.use(serveStatic('assets', {
	index: false,
	redirect: false
}));

/** routes **/

app.get('/', authenticatedOnly, function (req, res) {
	res.render('index', {user: req.user});
});

app.get('/account', authenticatedOnly, function(req, res){
	res.render('account', {user: req.user});
});

app.get('/login', function(req, res){
	res.render('login', {user: req.user});
});

app.get('/auth/twitter', passport.authenticate('twitter'), function (req, res) {
	// The request will be redirected to Twitter for authentication, so this
	// function will not be called.
});

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
	failureRedirect: '/login'
}), function (req, res) {
	res.redirect('/');
});

var server = app.listen(config.port, function () {
	console.log('Listening on port %d', server.address().port);
});
