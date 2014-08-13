var express = require('express');
var session = require('express-session');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var serveStatic = require('serve-static');
var passport = require('passport');
var passportTwitter = require('passport-twitter');
var CSON = require('cson');
var fs = require('fs');

var config = require('./config');

var quizNumber = null;
var quizAnswer = null;

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
		callbackURL: config.hostname + 'auth/twitter/callback'
	},
	function(token, tokenSecret, profile, done) {
		process.nextTick(function () {
			return done(null, profile);
		});
	}
));

var authenticatedOnly = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect(config.hostname + 'login');
};

var adminOnly = function (req, res, next) {
	if (req.isAuthenticated() && req.user.username === config.admin) {
		return next();
	}
	res.redirect(config.hostname);
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

/***** routes *****/

app.get('/', authenticatedOnly, function (req, res) {
	if (quizNumber === null) {
		res.render('index', {
			user: req.user,
			scripts: ['index.js']
		});
	} else {
		var quizFile = 'quizes/' + quizNumber + '/quiz.cson';

		CSON.parseFile(quizFile, function (error, quiz) {
			res.render('index', {
				user: req.user,
				quiz: quiz,
				scripts: ['index.js']
			});
		});
	}
});

app.post('/', authenticatedOnly, function (req, res) {
	if (quizAnswer === null) {
		res.send('error');
	} else {
		if (quizAnswer === req.body.answer) {
			res.send('ok');
		} else {
			res.send('ng');
		}
	}
})

app.get('/admin', adminOnly, function (req, res) {
	fs.readdir('quizes', function (error, files) {
		res.render('admin', {
			scripts: ['admin.js'],
			quizes: files
		});
	});
});

app.post('/admin', adminOnly, function (req, res) {
	quizNumber = req.body.quizNumber;

	console.log('Quiz number set to ' + quizNumber);

	var quizFile = 'quizes/' + quizNumber + '/quiz.cson';

	CSON.parseFile(quizFile, function (error, quiz) {
		quizAnswer = quiz.answer;
	});

	res.send('ok');
});

app.get('/account', authenticatedOnly, function (req, res) {
	res.render('account', {user: req.user});
});

app.get('/login', function (req, res) {
	res.render('login', {user: req.user});
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
	failureRedirect: config.hostname + 'login'
}), function (req, res) {
	res.redirect(config.hostname);
});

/***** Start Server *****/

var server = app.listen(config.port, function () {
	console.log('Listening on port %d', server.address().port);
});
